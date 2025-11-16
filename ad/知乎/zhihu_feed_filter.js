/**
 * 知乎信息流广告和推广过滤脚本
 * 用于 Surge iOS
 *
 * 功能：过滤推荐流和热榜中的广告卡片、圈子推荐等推广内容
 * 使用方法：将此脚本配置在 Surge 的 [Script] 部分
 */

let body = $response.body;

try {
  let obj = JSON.parse(body);

  if (obj.data && Array.isArray(obj.data)) {
    let originalLength = obj.data.length;

    // 过滤掉广告和推广卡片
    obj.data = obj.data.filter(item => {
      // 过滤 feed_advert 类型的广告
      if (item.type === 'feed_advert') {
        console.log('已过滤: feed_advert 广告');
        return false;
      }

      // 过滤包含广告标识的卡片
      if (item.ad || item.adjson) {
        console.log('已过滤: 包含ad字段的广告');
        return false;
      }

      // 过滤ID包含AD_前缀的卡片
      if (item.id && item.id.toString().startsWith('AD_')) {
        console.log('已过滤: ID包含AD_前缀的广告');
        return false;
      }

      // 检查 brief 字段
      if (item.brief) {
        try {
          let brief = typeof item.brief === 'string' ? JSON.parse(item.brief) : item.brief;
          if (brief.type === 'feed_advert' || brief.source === 'PR') {
            console.log('已过滤: brief包含广告标识');
            return false;
          }
        } catch (e) {
          // brief解析失败，继续其他检查
        }
      }

      // 检查 ext_info 字段
      if (item.ext_info && item.ext_info.party_id === 'BRAND') {
        console.log('已过滤: 品牌推广');
        return false;
      }

      // 【新增】过滤 extra.promotion 字段（知乎最新的广告标识）
      if (item.extra && item.extra.promotion) {
        console.log('已过滤: promotion推广内容 (ID: ' + (item.extra.promotion.id || 'unknown') + ')');
        return false;
      }

      // 【新增】过滤 commercial_info 字段
      if (item.commercial_info) {
        console.log('已过滤: commercial_info广告');
        return false;
      }

      // 【新增】过滤卡片标签为广告的内容
      if (item.card_label && item.card_label.type === 'ad') {
        console.log('已过滤: card_label标记为广告');
        return false;
      }

      // 【新增】过滤 commercial_card 和 promotion 类型
      if (item.type === 'commercial_card' || item.type === 'promotion') {
        console.log('已过滤: ' + item.type + '类型广告');
        return false;
      }

      // ========== 圈子推荐过滤 ==========

      // 过滤圈子相关类型的卡片
      const ringTypes = ['ring_card', 'circle_card', 'ring_recommend', 'circle_recommend'];
      if (item.type && ringTypes.includes(item.type)) {
        console.log('已过滤: 圈子推荐卡片 (类型: ' + item.type + ')');
        return false;
      }

      // 检查ID是否包含ring/circle关键词
      if (item.id && (item.id.toString().includes('ring_') || item.id.toString().includes('circle_'))) {
        console.log('已过滤: 圈子推荐 (ID包含ring/circle)');
        return false;
      }

      // 检查children中是否包含圈子相关文案
      if (item.children && Array.isArray(item.children)) {
        let hasRingText = false;
        const ringKeywords = ['查看圈子', '加入圈子', '圈子推荐', '推荐圈子', '圈子广场'];

        for (let child of item.children) {
          if (child.text) {
            for (let keyword of ringKeywords) {
              if (child.text.includes(keyword)) {
                hasRingText = true;
                console.log('已过滤: 圈子推荐 (包含"' + keyword + '"文案)');
                break;
              }
            }
          }
          if (hasRingText) break;
        }

        if (hasRingText) {
          return false;
        }
      }

      // 检查卡片JSON字符串中是否包含圈子关键词（更严格的检查）
      try {
        const itemStr = JSON.stringify(item);
        // 如果同时包含"圈子"和"推荐"/"查看"/"加入"等关键词，则过滤
        if (itemStr.includes('圈子') &&
            (itemStr.includes('推荐') || itemStr.includes('查看') ||
             itemStr.includes('加入') || itemStr.includes('广场'))) {
          // 但要排除正常内容中偶然提到圈子的情况
          // 检查是否有明确的圈子推广标识
          if (itemStr.includes('ring_') || itemStr.includes('查看圈子') || itemStr.includes('加入圈子')) {
            console.log('已过滤: 圈子推荐 (内容包含圈子推广标识)');
            return false;
          }
        }
      } catch (e) {
        // JSON序列化失败，跳过
      }

      return true;
    });

    let filteredCount = originalLength - obj.data.length;
    if (filteredCount > 0) {
      console.log(`知乎去广告: 已过滤 ${filteredCount} 条推广内容，剩余 ${obj.data.length} 条内容`);
    }

    body = JSON.stringify(obj);
  }
} catch (error) {
  console.log('知乎去广告脚本错误: ' + error);
}

$done({ body });
