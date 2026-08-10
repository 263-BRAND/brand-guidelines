# Task 2: 创建 company-data.json

## Requirements

合并 `company-data/facts.json` 和 `company-data/products.json` 为单一文件 `company-data.json`。

- profile 长文保留在 `company-data/profile-zh.md` 和 `company-data/profile-en.md`，仅在 JSON 中引用路径
- 里程碑取前 23 条（完整列表）
- 产品信息从 products.json 完整迁移

## Exact File Content (use verbatim)

```json
{
  "name": {
    "fullZh": "二六三网络通信股份有限公司",
    "fullEn": "263 Network Communication, Inc.",
    "short": "263集团"
  },
  "stock": "002467.SZ",
  "founded": "1997-12-28",
  "headquarters": "北京市昌平区超前路13号",
  "operationCenter": "北京市朝阳区和平里东土城路14号建达大厦17-18层",
  "website": "https://www.net263.com",
  "phone": "010-84291263",
  "brand": {
    "positioning": "全球数智通信服务商",
    "vision": "全球数智通信服务商",
    "mission": "提升沟通体验和组织效率",
    "purpose": "连接世界 沟通你我"
  },
  "customerScale": {
    "enterprise": "15万+",
    "individual": "千万级"
  },
  "products": [
    {
      "id": "global-network",
      "name": "全球网络",
      "tagline": "构建新一代信息高速公路",
      "description": "拥有计算、存储、网络、5G、安全等基础设施综合能力，提供数据中心、虚拟专网、国际海缆及移动通信的技术支持与运营维护。",
      "subProducts": ["数据中心", "虚拟专网", "国际海缆", "移动通信"]
    },
    {
      "id": "intelligent-communication",
      "name": "智能通信",
      "tagline": "AI融合的通信解决方案",
      "description": "将语音通话、即时消息、视频直播、邮件服务等通信产品与AI技术融合，打造智能客服、智能助理、智联中心等系列产品。",
      "subProducts": ["智能客服", "智能助理", "智联中心", "企业邮箱", "云会议", "企业直播"]
    },
    {
      "id": "digital-service",
      "name": "数字服务",
      "tagline": "数据驱动+智能技术，全链条数字化",
      "description": "以数据驱动+智能技术为核心，构建覆盖数字人、智能体、知识库、内容风控的全链条数字化服务体系。",
      "subProducts": ["数字人", "智能体", "知识库", "内容风控"]
    }
  ],
  "milestones": [
    { "year": "1997", "title": "公司成立", "description": "1997年12月28日，创立于北京，推出互联网接入服务(ISP)试运营。" },
    { "year": "1998", "title": "首推主叫计费拨号上网", "description": "国内首推的主叫计费拨号上网接入服务正式运营，同年推出个人免费邮箱系统，注册用户突破200万。" },
    { "year": "2000", "title": "全国最大ISP服务商", "description": "推出95963全国统一接入号，成为全国最大的ISP服务商。" },
    { "year": "2001", "title": "四星级IDC + 2000万邮箱用户", "description": "成为国内四星级互联网数据中心服务商(IDC)，263免费邮箱注册用户突破2000万。" },
    { "year": "2002", "title": "推出263企业邮箱", "description": "推出263企业邮箱，免费邮箱转型收费邮箱，开启全面商用新征程。" },
    { "year": "2003", "title": "国内最大IP长途代理", "description": "推出96446业务，成长为国内最大的IP长途电话代理商。" },
    { "year": "2004", "title": "多方通信商用牌照", "description": "开通950509多方通话，成为首批拥有国内多方通信商用试验许可牌照的电信增值服务商之一。" },
    { "year": "2008", "title": "进军海外华人通信", "description": "入资美国VoIP运营商iTalkBB，开始海外华人通信服务的业务部署。" },
    { "year": "2010", "title": "深交所A股上市", "description": "2010年9月8日，深圳A股挂牌上市，股票代码002467。" },
    { "year": "2011", "title": "推出263电话会议", "description": "推出263电话会议，发力企业会议市场。" },
    { "year": "2012", "title": "发布云通信产品战略", "description": "发布263云通信产品战略，整合企业邮箱、电话会议和IM，布局企业融合通信。" },
    { "year": "2014", "title": "获得虚拟运营商牌照", "description": "获得移动通信转售业务试点资质(虚拟运营商)，开始移动通信业务运营。" },
    { "year": "2015", "title": "全资收购展视互动", "description": "全资收购直播厂商展视互动，加码企业通信协作市场。" },
    { "year": "2016", "title": "与NTT合作IDC业务", "description": "与NTT集团合作成立合资公司，获得互联网资源协作牌照，专注于国际IDC业务开拓。" },
    { "year": "2017", "title": "联合Arkadin云通信", "description": "联合Arkadin提供云通信解决方案，提供领先的中国市场电话会议解决方案。" },
    { "year": "2018", "title": "收购日升集团", "description": "收购日升集团100%股权，提供企业跨境数据通信服务。" },
    { "year": "2019", "title": "发布\"视频+\"战略", "description": "发布\"视频+\"战略，夯实音视频基础实力。" },
    { "year": "2020", "title": "推出263云视", "description": "推出263云视，提升企业视频沟通与协作效率。" },
    { "year": "2021", "title": "推进办公国产化", "description": "推出信创版企业邮箱，率先推进办公应用国产化。" },
    { "year": "2022", "title": "AI数字化战略", "description": "启动\"打造智能云连接 赋能数字化转型\"战略。" },
    { "year": "2023", "title": "推出AI数字人", "description": "推出AI数字人，打造智能新连接。" },
    { "year": "2024", "title": "三大增长引擎", "description": "布局企业全球化、数字化、智能化三大增长引擎。" },
    { "year": "2025", "title": "布局数智通信", "description": "布局数智通信，发力AI应用。" }
  ],
  "profile": {
    "zh": "company-data/profile-zh.md",
    "en": "company-data/profile-en.md"
  }
}
```

## Steps

1. Write the file to `company-data.json`
2. Verify JSON is valid: `node -e "JSON.parse(require('fs').readFileSync('company-data.json','utf-8'))" && echo "OK"`
3. Commit

## Verification

- File exists at `company-data.json`
- Valid JSON
- 23 milestones
- 3 products
- profile fields are file path references, not embedded text
