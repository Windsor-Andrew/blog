'use strict';

hexo.extend.generator.register('wordcloud_data', function(locals) {

  // ── 直接使用 Node 内置，不需要 require 任何包 ──
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });

  const stopwords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人',
    '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
    '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '但',
    '与', '或', '及', '等', '为', '以', '从', '对', '中', '而',
    '文章', '内容', '本文', '介绍', '使用', '可以', '进行', '通过',
    '方法', '实现', '如果', '需要', '问题', '代码', '配置', '设置',
  ]);

  const freqMap = {};

  locals.posts.each(post => {
    const text = (post.content || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/`[^`]*`/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[#*>\[\]()!_~]/g, ' ');

    // Intl.Segmenter 返回迭代器，segments() 每项有 segment 和 isWordLike 属性
    const segments = segmenter.segment(text);
    for (const { segment: w, isWordLike } of segments) {
      // isWordLike: true 表示是"词"而非标点/空格，过滤掉非词项
      if (!isWordLike) continue;
      const word = w.trim();
      if (
        word.length < 2 ||
        stopwords.has(word) ||
        /^\d+$/.test(word) ||
        /^[^\u4e00-\u9fa5a-zA-Z]+$/.test(word)
      ) continue;
      freqMap[word] = (freqMap[word] || 0) + 1;
    }
  });

  const sorted = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([word, count]) => [word, count]);

  return {
    path: 'wordcloud.json',
    data: JSON.stringify(sorted)
  };
});