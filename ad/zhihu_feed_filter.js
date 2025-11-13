/**
 * 知乎信息流广告过滤脚本
 * 用于 Surge iOS
 *
 * 功能：过滤推荐流和热榜中的广告卡片
 * 使用方法：将此脚本配置在 Surge 的 [Script] 部分
 */

let body = $response.body;

try {
  let obj = JSON.parse(body);

  if (obj.data && Array.isArray(obj.data)) {
    let originalLength = obj.data.length;

    // 过滤掉广告卡片
    obj.data = obj.data.filter(item => {
      // 过滤 feed_advert 类型的广告
      if (item.type === 'feed_advert') {
        console.log('已过滤广告: feed_advert');
        return false;
      }

      // 过滤包含广告标识的卡片
      if (item.ad || item.adjson) {
        console.log('已过滤广告: 包含ad字段');
        return false;
      }

      // 过滤ID包含AD_前缀的卡片
      if (item.id && item.id.toString().startsWith('AD_')) {
        console.log('已过滤广告: ID包含AD_前缀');
        return false;
      }

      // 检查 brief 字段
      if (item.brief) {
        try {
          let brief = typeof item.brief === 'string' ? JSON.parse(item.brief) : item.brief;
          if (brief.type === 'feed_advert' || brief.source === 'PR') {
            console.log('已过滤广告: brief包含广告标识');
            return false;
          }
        } catch (e) {
          // brief解析失败，继续其他检查
        }
      }

      // 检查 ext_info 字段
      if (item.ext_info && item.ext_info.party_id === 'BRAND') {
        console.log('已过滤广告: 品牌推广');
        return false;
      }

      return true;
    });

    let filteredCount = originalLength - obj.data.length;
    if (filteredCount > 0) {
      console.log(`知乎去广告: 已过滤 ${filteredCount} 条广告，剩余 ${obj.data.length} 条内容`);
    }

    body = JSON.stringify(obj);
  }
} catch (error) {
  console.log('知乎去广告脚本错误: ' + error);
}

$done({ body });
