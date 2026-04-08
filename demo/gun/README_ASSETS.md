# 游戏资源索引

## 图标文件 (images/)

### 游戏UI图标
- `crosshair.svg` - 准星图标
- `weapon.svg` - 武器图标 (沙漠之鹰)
- `health.svg` - 血量图标 (红心)
- `shield.svg` - 护盾图标 (蓝色盾牌)
- `ammo.svg` - 弹药图标 (子弹)

### 角色图标
- `player.svg` - 玩家图标 (绿色蛋仔军人)
- `enemy.svg` - 敌人图标 (红色蛋仔军人)

## 背景文件 (bg/)

### SVG背景
- `desert_background.svg` - 沙漠背景 (1200x800)
- `city_background.svg` - 城市背景 (1200x800)
- `military_background.svg` - 军事基地背景 (1200x800)

### CSS纹理
- `textures.css` - 各种纹理效果类
  - `.desert-camo` - 沙漠迷彩纹理
  - `.urban-ruins` - 城市废墟纹理
  - `.military-camo` - 军事迷彩纹理
  - `.metal-grid` - 金属网格纹理
  - `.concrete` - 混凝土纹理
  - `.battle-smoke` - 战场烟雾效果
  - `.bullet-holes` - 弹孔效果
  - `.night-vision` - 夜视效果
  - `.thermal-vision` - 热成像效果

## 使用方法

### 在HTML中使用图标
```html
<img src="images/crosshair.svg" alt="准星" width="32" height="32">
```

### 在CSS中使用背景
```css
.game-background {
    background-image: url('bg/desert_background.svg');
    background-size: cover;
}

/* 或使用纹理类 */
.desert-area {
    @import url('bg/textures.css');
}
```

### 在JavaScript中动态加载
```javascript
// 加载图标
const crosshairIcon = new Image();
crosshairIcon.src = 'images/crosshair.svg';

// 设置背景
document.body.style.backgroundImage = "url('bg/military_background.svg')";
```

## 图标规格
- 所有图标都是SVG格式，支持无损缩放
- 标准尺寸: 32x32px (可缩放)
- 武器图标: 48x32px
- 背景图片: 1200x800px (游戏画布尺寸)

## 颜色主题
- 玩家: 绿色系 (#2ecc71, #27ae60)
- 敌人: 红色系 (#e74c3c, #c0392b)
- UI元素: 蓝色系 (#3498db, #2980b9)
- 武器/弹药: 橙色系 (#f39c12, #e67e22)
- 军事装备: 灰色系 (#34495e, #2c3e50)