'use strict';

const { cut } = require('@node-rs/jieba');

hexo.extend.generator.register('wordcloud_data', function(locals) {

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
    const raw = post.content || '';

    const text = raw
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/`[^`]*`/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[#*>\[\]()!_~]/g, ' ')
      .replace(/[a-zA-Z0-9]{1}/g, '');

    const words = cut(text, true);  // ← 修复：jieba.cut → cut

    words.forEach(w => {
      w = w.trim();
      if (
        w.length < 2 ||
        stopwords.has(w) ||
        /^\d+$/.test(w) ||
        /^[^\u4e00-\u9fa5a-zA-Z]+$/.test(w)
      ) return;

      freqMap[w] = (freqMap[w] || 0) + 1;
    });
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