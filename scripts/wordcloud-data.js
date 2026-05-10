'use strict';

hexo.extend.generator.register('wordcloud_data', function(locals) {
  // locals 是 Hexo 暴露的全局数据对象
  // locals.posts  → 所有文章集合
  // locals.tags   → 所有标签
  // locals.pages  → 所有页面（about/photos 等）

  const jieba = require('nodejieba');

  // ── 停用词表：这些词出现再多也无意义 ──────────────────────────
  const stopwords = new Set([
    // 虚词、助词
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人',
    '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
    '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '但',
    '与', '或', '及', '等', '为', '以', '从', '对', '中', '而',
    // 博客常见无意义词（按需增减）
    '文章', '内容', '本文', '介绍', '使用', '可以', '进行', '通过',
    '方法', '实现', '如果', '需要', '问题', '代码', '配置', '设置',
  ]);

  const freqMap = {};   // { "毫米波": 12, "嵌入式": 8, ... }

  locals.posts.each(post => {
    // post.content 是渲染后的 HTML，需要先清洗
    const raw = post.content || '';

    const text = raw
      .replace(/```[\s\S]*?```/g, '')   // 去掉代码块（防止代码关键字污染词云）
      .replace(/<[^>]+>/g, ' ')          // 去掉所有 HTML 标签
      .replace(/`[^`]*`/g, '')           // 去掉行内代码
      .replace(/https?:\/\/\S+/g, '')    // 去掉 URL
      .replace(/[#*>\[\]()!_~]/g, ' ')   // 去掉 Markdown 符号
      .replace(/[a-zA-Z0-9]{1}/g, '');  // 去掉单个英文字母（噪音）

    // jieba.cut(str, true) → 精确模式分词，返回 string[]
    // 例："毫米波通信系统" → ["毫米波", "通信", "系统"]
    const words = jieba.cut(text, true);

    words.forEach(w => {
      w = w.trim();
      // 过滤：长度<2、停用词、纯数字、纯英文标点
      if (
        w.length < 2 ||
        stopwords.has(w) ||
        /^\d+$/.test(w) ||
        /^[^\u4e00-\u9fa5a-zA-Z]+$/.test(w)  // 全是标点符号
      ) return;

      freqMap[w] = (freqMap[w] || 0) + 1;
    });
  });

  // 按词频降序，取前 80 个，避免词云过于拥挤
  const sorted = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([word, count]) => [word, count]);
  // 最终格式：[["毫米波", 12], ["嵌入式", 8], ...]

  // 返回值告诉 Hexo 生成 public/wordcloud.json
  return {
    path: 'wordcloud.json',
    data: JSON.stringify(sorted)
  };
});