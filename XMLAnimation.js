/**
 * Adobe Flash Sprite Animation
 * @version 1.0.2
 * @author Denis Baskovsky (denis@baskovsky.ru)
 **/
!function (cc) {
    'use strict';

    if (cc === null || typeof cc === 'undefined') {
        throw 'Cocos 2d not found!';
    }

    var xmlAnimationMemoize = [];

    cc.Class.XMLAnimation = cc.Animation.extend({

        _filePNG: null,
        _fileXML: null,
        _textures: null,

        ctor: ctor,
        init: init,
        loadXml: loadXml,
        getTextures: getTextures,

        /* переопреди эту функцию для конечного колбэка */
        onLoaded: function () {
            //TODO: добавить проверку на текущую сцену
            cc.error('onLoaded non callback!');
        }

    });

    function ctor(fileXML, filePNG) {

        this._super();

        var _this = this;
        this._fileXML = fileXML;

        if (filePNG) {
            _this._filePNG = filePNG;
        }

        this.loadXml(function () {
            _this.init(function () {
                _this.onLoaded();
            });
        });

    }

    function init(mainCallback) {

        var textureAtlas = new cc.AtlasNode(),
        //var textureAtlas = new cc.TextureAtlas(), //TODO: if WEBGL use this
            elemTextures = this.getTextures(),
            _this = this;

        preloadCallback();

        function preloadCallback() {
            //TODO: if WEBGL use this
            //textureAtlas.initWithFile(_this._filePNG, _this.totalDelayUnits);
            //var atlasImage = textureAtlas.getTexture();

            // or use canvas 2d
            var fileSprite = new cc.Sprite(_this._filePNG);
            textureAtlas.init();
            // or END

            var atlasImage = fileSprite.getTexture();

            for (var i = 0, len = elemTextures.length; i < len; ++i) {
                var curElem = elemTextures[i];

                _this.addSpriteFrameWithTexture(
                    atlasImage,
                    cc.rect(
                        curElem.x,
                        curElem.y,
                        curElem.width,
                        curElem.height)
                );
            }

            mainCallback();
        }
    }


    function getTextures() {
        return this._textures;
    }

    function loadXml(cb) {
        var _this = this;

        var isExist = xmlAnimationMemoize.some(function (e) {
            return e.key === _this._fileXML;
        });

        if (!isExist) {
            var xhr = cc.loader.getXMLHttpRequest();

            xhr.open('GET', this._fileXML, true);
            xhr.onload = onload;
            xhr.onerror = onerror;
            xhr.send(null);

        } else {
            var xml = xmlAnimationMemoize.filter(function (e) {
                return e.key === _this._fileXML;
            })[0];

            serialize(xml.value);

            setTimeout(function () {
                cb();
            }, 0);
        }

        function onerror(e) {
            cc.log('xhr error');
            throw e;
        }

        function onload() {
            if (xhr.readyState === xhr.DONE && xhr.status === 200 && xhr.responseXML) {

                serialize(xhr.responseXML);

                setToMemoize(_this._fileXML, xhr.responseXML);

                cb();

            } else {
                return cc.error('Geting XML error');
            }
        }

        function setToMemoize(key, value) {

            xmlAnimationMemoize.push({
                key: key,
                value: value
            });
        }

        function serialize(xml) {

            var atlasTag = xml.getElementsByTagName('TextureAtlas'),
                subTextures = null,
                textures = [];

            if (typeof atlasTag === 'undefined') {
                throw 'atlasTag is not found!';
            }

            atlasTag = atlasTag[0];
            subTextures = atlasTag.getElementsByTagName('SubTexture');

            for (var i = 0, len = subTextures.length; i < len; ++i) {
                addTexture(subTextures[i]);
            }

            _this._textures = _this.textures = textures;
            _this._totalDelayUnits = _this.totalDelayUnits = subTextures.length;

            if (!_this._filePNG) {
                setImagePathFromXML();
            }

            function addTexture(elem) {
                textures.push({
                    name: elem.getAttribute('name') || String(Math.random()),
                    x: elem.getAttribute('x') | 0,
                    y: elem.getAttribute('y') | 0,
                    width: elem.getAttribute('width') | 0,
                    height: elem.getAttribute('height') | 0,
                    frameX: elem.getAttribute('frameX') | 0,
                    frameY: elem.getAttribute('frameY') | 0,
                    frameWidth: elem.getAttribute('frameWidth') | 0,
                    frameHeight: elem.getAttribute('frameHeight') | 0
                });
            }

            function setImagePathFromXML() {
                _this._filePNG =
                    _this._fileXML.replace(/\/[a-zA-Z0-9_]+.xml$/, '/' + atlasTag.getAttribute('imagePath'));
            }

        }
    }

}(window.cc);
