export const personas = {
  yione: {
    id: 'yione', name: 'YIOne', city: '上海', job: '创业交流 · 资源连接', certification: 'YIOne官方账号',
    bio: '帮助创业者交流想法，连接愿意分享经验、资源与机会的同行。',
    offer: ['创业交流', '伙伴与资源连接'],
    need: ['有想法的创业者', '愿意分享的同行'],
  },
  lin: {
    id: 'lin', name: '林舟', city: '上海', job: 'AI 产品 · 早期验证',
    bio: '正在打磨早期产品，愿意分享用户研究与产品验证经验，也希望认识技术伙伴。',
    offer: ['产品设计与用户研究', '早期产品验证经验'],
    need: ['技术合伙人', '早期用户交流'],
  },
  zhou: {
    id: 'zhou', name: '周岚', city: '上海', job: '生物发酵 · 市场拓展', certification: '生物发酵领域专家',
    bio: '正在梳理发酵食品的市场机会，希望认识做菌种研发和产品转化的伙伴。',
    offer: ['发酵产品市场推广', '食品品牌渠道对接'],
    need: ['发酵技术团队', '新产品合作机会'],
  },
  chen: {
    id: 'chen', name: '陈序', city: '杭州', job: '合成生物 · 产品研发', certification: '合成生物领域专家',
    bio: '关注发酵工艺从实验室走向产品的过程，愿意交流研发与应用落地经验。',
    offer: ['菌株研发与工艺优化', '小试到中试经验'],
    need: ['市场拓展伙伴', '食品与原料应用场景'],
  },
  xu: {
    id: 'xu', name: '许宁', city: '苏州', job: '食品原料 · 创业者', certification: '食品原料领域专家',
    bio: '从真实应用需求出发寻找新原料，希望和产品及技术伙伴共同开发。',
    offer: ['功能性原料供应', '品牌客户需求对接'],
    need: ['生物发酵产品', '联合开发合作伙伴'],
  },
};

export const personaList = ['zhou', 'chen', 'xu'].map(id => personas[id]);
export const personaFromContext = context => personas[context?.person] || personas.zhou;
export const certificationText = person => person?.certification ? `✹ ${person.certification}` : '未认证';
