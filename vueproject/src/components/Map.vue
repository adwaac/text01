<template>
  <div class="map-container">
    <div id="container"></div>
    <div id="aaa"></div>
  </div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";

export default {
  name: "map-view",
  props: {
    attractionName: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.initAMap();
  },
  beforeDestroy() {
    this.map?.destroy();
  },
  methods: {
    initAMap() {
      window._AMapSecurityConfig = {
        securityJsCode: "657885a68dc544f8307542bdb7e8bf2a",
      };
      AMapLoader.load({
        key: "a01b9b108e9d0c85e755c1e4dcabecbb",
        version: "2.0",
        plugins: ["AMap.Driving", "AMap.Geolocation", "AMap.ToolBar", "AMap.Scale", "AMap.Geocoder"],
        AMapUI: {
          version: '1.1'
        }
      })
        .then((AMap) => {
          this.map = new AMap.Map("container", {
            viewMode: "3D",
            zoom: 11,
            center: [116.397428, 39.90923],
            resizeEnable: true,
            useNative: true
          });

          // 缩放按钮
          const toolbar = new AMap.ToolBar();
          this.map.addControl(toolbar);

          // 标尺
          const scale = new AMap.Scale();
          this.map.addControl(scale);

          // 定位并规划路线
          const geo = new AMap.Geolocation();
          this.map.addControl(geo);
          
          geo.getCurrentPosition((status, result) => {
            if (status === 'complete') {
              const currentPosition = result.position;
              console.log('当前位置:', currentPosition);
              console.log('目标景点:', this.attractionName);
              
              // 创建驾车路线规划实例
              const driving = new AMap.Driving({
                map: this.map,
                panel: "aaa",
                policy: AMap.DrivingPolicy.LEAST_TIME
              });

              // 直接使用关键词搜索
              driving.search(
                [currentPosition.lng, currentPosition.lat],
                this.attractionName,
                (status, result) => {
                  if (status === 'complete') {
                    console.log('路线规划成功');
                  } else {
                    console.error('路线规划失败:', result);
                    // 如果路线规划失败，尝试使用地理编码
                    const geocoder = new AMap.Geocoder();
                    geocoder.getLocation(this.attractionName, (status, result) => {
                      if (status === 'complete' && result.geocodes.length) {
                        const destination = result.geocodes[0].location;
                        console.log('目标位置:', destination);
                        
                        driving.search(
                          [currentPosition.lng, currentPosition.lat],
                          [destination.lng, destination.lat],
                          (status, result) => {
                            if (status === 'complete') {
                              console.log('使用坐标规划路线成功');
                            } else {
                              console.error('使用坐标规划路线失败:', result);
                            }
                          }
                        );
                      } else {
                        console.error('地理编码失败');
                      }
                    });
                  }
                }
              );
            } else {
              console.error('获取位置失败');
              // 如果获取位置失败，使用默认起点
              const driving = new AMap.Driving({
                map: this.map,
                panel: "aaa",
                policy: AMap.DrivingPolicy.LEAST_TIME
              });

              driving.search(
                "中粮祥云小镇",
                this.attractionName,
                (status, result) => {
                  if (status === 'complete') {
                    console.log('使用默认起点规划路线成功');
                  } else {
                    console.error('使用默认起点规划路线失败:', result);
                  }
                }
              );
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
};
</script>

<style scoped>
.map-container {
  display: flex;          /* 使用 Flexbox 布局 */
  height: 800px;          /* 设置总高度 */
}

#container {
  flex: 1;                /* 地图容器占据剩余空间 */
  height: 100%;           /* 高度占满父容器 */
}

#aaa {
  width: 300px;           /* 路线信息面板固定宽度 */
  height: 100%;           /* 高度占满父容器 */
  background-color: white; /* 设置背景色确保不透明 */
  overflow: auto;         /* 添加滚动条处理过长内容 */
}
</style>