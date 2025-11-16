/**
 * 起点读书去广告脚本
 * 用于Surge的http-response脚本
 *
 * 功能：
 * 1. 移除广告列表API的广告数据
 * 2. 清空闪屏广告配置
 * 3. 移除书架悬浮广告
 * 4. 清理Widget广告内容
 * 5. 移除签到页面广告
 * 6. 隐藏每日推荐（猜你喜欢）
 * 7. 清除书架顶部操作横幅广告
 */

const url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);

    // 1. 处理广告列表批量获取接口
    // /argus/api/v2/adv/getadvlistbatch
    if (url.includes('/adv/getadvlistbatch')) {
        if (obj.Data) {
            obj.Data = {};
        }
        console.log('已拦截广告列表批量接口');
    }

    // 2. 处理书架悬浮广告接口
    // /argus/api/v1/bookshelf/getHoverAdv
    else if (url.includes('/bookshelf/getHoverAdv')) {
        if (obj.Data) {
            // 清空广告数据
            obj.Data.AdvInfo = null;
            obj.Data.ShowAdv = false;
            if (obj.Data.AdvList) {
                obj.Data.AdvList = [];
            }
            // 清空ItemList（悬浮广告列表）
            if (obj.Data.ItemList) {
                obj.Data.ItemList = [];
            }
        }
        console.log('已清除书架悬浮广告');
    }

    // 3. 处理闪屏广告接口
    // /argus/api/v4/client/getsplashscreen
    else if (url.includes('/getsplashscreen')) {
        if (obj.Data) {
            obj.Data.AdList = [];
            obj.Data.SplashAdList = [];
            obj.Data.TipList = [];
            obj.Data.VideoAdList = [];
            // 清空List字段（主要的闪屏广告列表）
            if (obj.Data.List) {
                obj.Data.List = [];
            }
        }
        console.log('已清除闪屏广告配置');
    }

    // 4. 处理iOS广告接口
    // /argus/api/v1/client/iosad
    else if (url.includes('/client/iosad')) {
        obj.Data = {};
        obj.Result = 0;
        console.log('已拦截iOS广告请求');
    }

    // 5. 处理Widget内容接口（可能包含广告）
    // /argus/api/v1/widget/getContent
    else if (url.includes('/widget/getContent')) {
        if (obj.Data && obj.Data.WidgetInfo) {
            // 移除广告类型的Widget
            if (obj.Data.WidgetInfo.WidgetType === 'ad' ||
                obj.Data.WidgetInfo.WidgetType === 'advertisement') {
                obj.Data.WidgetInfo = null;
            }
            // 移除Widget列表中的广告
            if (obj.Data.WidgetList && Array.isArray(obj.Data.WidgetList)) {
                obj.Data.WidgetList = obj.Data.WidgetList.filter(item => {
                    return !(item.WidgetType === 'ad' ||
                           item.WidgetType === 'advertisement' ||
                           item.IsAd === true ||
                           item.isAd === true);
                });
            }
        }
        console.log('已过滤Widget广告内容');
    }

    // 6. 处理签到简要信息接口（可能包含广告）
    // /argus/api/v2/checkin/simpleinfo
    else if (url.includes('/checkin/simpleinfo')) {
        if (obj.Data) {
            // 移除广告相关字段
            if (obj.Data.AdInfo) {
                obj.Data.AdInfo = null;
            }
            if (obj.Data.AdvInfo) {
                obj.Data.AdvInfo = null;
            }
            if (obj.Data.BottomAdv) {
                obj.Data.BottomAdv = null;
            }
            if (obj.Data.FloatAdv) {
                obj.Data.FloatAdv = null;
            }
        }
        console.log('已清除签到页面广告');
    }

    // 7. 处理每日推荐接口（猜你喜欢）
    // /argus/api/v1/dailyrecommend/recommendBook
    else if (url.includes('/dailyrecommend/recommendBook')) {
        // 返回空数据，隐藏"猜你喜欢"推荐
        obj.Data = null;
        obj.Result = 0;
        console.log('已隐藏每日推荐（猜你喜欢）');
    }

    // 8. 处理书架顶部操作横幅（包含广告）
    // /argus/api/v1/bookshelf/getTopOperation
    else if (url.includes('/bookshelf/getTopOperation')) {
        if (obj.Data) {
            // 清空所有顶部操作项（通常包含广告）
            obj.Data.Items = [];
            // 清空主要信息（横幅广告）
            if (obj.Data.MainInfo) {
                obj.Data.MainInfo = null;
            }
        }
        console.log('已清除书架顶部操作横幅广告');
    }

    // 9. 处理每日推荐完整版接口（V2版本）
    // /argus/api/v2/dailyrecommend/getdailyrecommend
    else if (url.includes('/dailyrecommend/getdailyrecommend')) {
        if (obj.Data) {
            // 清空推荐书籍列表
            obj.Data.Items = [];
            // 清空背景信息
            if (obj.Data.BgInfo) {
                obj.Data.BgInfo = null;
            }
            // 清空AI推荐入口
            if (obj.Data.AiRecommendUrl) {
                obj.Data.AiRecommendUrl = "";
            }
        }
        console.log('已清除每日推荐完整版（V2）');
    }

    // 10. 处理书架高级阅读信息（包含推荐书籍）
    // /argus/api/v1/bookshelf/getHighLevelBookReadInfo
    else if (url.includes('/getHighLevelBookReadInfo')) {
        if (obj.Data) {
            // 清空沉浸推荐书籍列表（SinkBookInfos）
            if (obj.Data.SinkBookInfos) {
                obj.Data.SinkBookInfos = [];
            }
        }
        console.log('已清除书架沉浸推荐');
    }

    body = JSON.stringify(obj);

} catch (error) {
    console.log('处理响应时出错: ' + error);
    // 如果解析失败，返回原始响应
}

$done({ body });
