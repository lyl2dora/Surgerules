// IT之家信息流广告过滤脚本
// 用于Surge的http-response脚本
// 过滤API响应中isAd为true的广告内容

let body = $response.body;

try {
    let obj = JSON.parse(body);

    // 递归过滤广告函数
    function filterAds(data) {
        if (Array.isArray(data)) {
            // 过滤数组中isAd为true的项
            return data.filter(item => {
                if (typeof item === 'object' && item !== null) {
                    // 如果有isAd字段且为true，则过滤掉
                    if (item.isAd === true || item.isAd === 1 || item.isAd === '1') {
                        return false;
                    }
                    // 递归处理对象的所有属性
                    for (let key in item) {
                        if (Array.isArray(item[key]) || typeof item[key] === 'object') {
                            item[key] = filterAds(item[key]);
                        }
                    }
                }
                return true;
            });
        } else if (typeof data === 'object' && data !== null) {
            // 处理对象
            for (let key in data) {
                if (Array.isArray(data[key]) || typeof data[key] === 'object') {
                    data[key] = filterAds(data[key]);
                }
            }
        }
        return data;
    }

    // 过滤广告
    obj = filterAds(obj);

    // 返回修改后的响应
    body = JSON.stringify(obj);
    $done({ body });

} catch (e) {
    // 解析失败，返回原始响应
    console.log('IT之家广告过滤失败: ' + e);
    $done({});
}
