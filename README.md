# cc_xml_animation
> Cocos2d Adobe Flash Sprite Animation

## Example
```js
var self = this;

var animationSprite = new cc.Sprite();
animationSprite.setPosition(cc.p(200, 200));
animationSprite.setAnchorPoint(cc.p(0.5, 1));

// put window.res animation_xml file
var freakAnimation = new cc.Class.XMLAnimation(res['animation_xml']);
freakAnimation.onLoaded = function () {
  var frames = freakAnimation.getFrames();
  var animation = new cc.Animation(frames, 0.05);

  animationSprite.runAction(new cc.RepeatForever(new cc.Animate(animation)));
  self.addChild(animationSprite, 1);
};
```
