/**
 * Created by Ryn on 2016/8/8.
 * 上下滑动组件
 */

import '../style/scroll.css';

import React from 'react';
import ReactDOM from 'react-dom';
import iScroll from 'iscroll/build/iscroll-probe';

const MyScroll = React.createClass({

    /**
     * 组件初始化状态
     * @returns {{myScroll: null, wrapperHeight: string}}
     */
    getInitialState() {
        return {
            myScroll : null,
            wrapperHeight : '100%',
            downTag : false,
            downText : '下拉刷新',
            upTag : false,
            upText : '上划加载更多',
            loadingText : "正在加载中",
            completeText : "没有数据咯",
            downShowText : '下拉刷新',
            upShowText : '上划加载更多',
            loadingStep : 0,
            defaultOptions : {
                probeType: 2,                   //probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
                scrollbars: false,               //有滚动条
                mouseWheel: true,               //允许滑轮滚动
                fadeScrollbars: true,           //滚动时显示滚动条，默认影藏，并且是淡出淡入效果
                bounce:true,                    //边界反弹
                interactiveScrollbars:true,     //滚动条可以拖动
                shrinkScrollbars:'scale',       // 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.
                click: true ,                   // 允许点击事件
                keyBindings:true,               //允许使用按键控制
                momentum:true                   // 允许有惯性滑动
            }
        }
    },

    /**
     * 下拉刷新
     */
    refresh() {
        let { myScroll, loadingStep, downText } = this.state;

        this.props.onRefresh(() => {
            if (loadingStep === 2) {
                myScroll.refresh();
            }
            this.setState({downTag: false, downShowText: downText, loadingStep : 0});
        });
    },

    /**
     * 上拉加载
     */
    pullLoad() {
        let { infinite } = this.props,
            { myScroll, loadingStep } = this.state;
        this.props.onPullLoad(() => {
            if (infinite) {
                if (loadingStep === 2) {
                    myScroll.refresh();
                }
                this.setState({upTag : false, loadingStep : 0});
            }
        });
    },

    /**
     * 滑动开始之前
     * @param _this1
     */
    beforeScrollStart(_this1) {
        // TODO
    },

    /**
     * 滑动开始
     * @param _this1
     */
    scrollStart(_this1) {
        // TODO
    },

    /**
     * 滑动结束
     * @param _this1
     */
    scrollEnd(_this1) {
        let { loadingStep, loadingText } = this.state;

        if (loadingStep === 1) {
            this.setState({
                downShowText : loadingText,
                loadingStep : 2
            }, () => {
                if (_this1.y >= 0) {
                    this.refresh();
                }

                if (_this1.y < 0) {
                    this.pullLoad();
                }
            });
        }
    },

    /**
     * 滑动中
     * @param _this1
     */
    scroll(_this1) {
        let { downTag, upTag, downText, upText } = this.state,
            offset_y = _this1.y;

        // 下拉刷新过程
        if (offset_y > 5) {
            this.setState({
                downTag : true,
                loadingStep : 1,
                downShowText : downText
            });
        }

        // 上拉加载过程
        if (offset_y < _this1.maxScrollY - 5) {
            this.setState({
                upTag : true,
                loadingStep : 1,
                upShowText : upText
            });
        }

    },

    /**
     * 初始化iscroll
     * @private
     */
    _initScroll() {
        let { myScroll, defaultOptions } = this.state,
            { options } = this.props,
            scrollElement = ReactDOM.findDOMNode(this.refs.scroll_wrapper),
            opts = Object.assign({}, defaultOptions, options),
            _this = this;

        /**
         * 如果不存在myScroll实例，则实例化
         */
        if (!myScroll) {
            myScroll = new iScroll(scrollElement, opts);
        }

        /**
         * 监听iscroll beforeScrollStart事件
         */
        myScroll.on('beforeScrollStart', function() {
            _this.beforeScrollStart(this);
        });

        /**
         * 监听iscroll scrollStart事件
         */
        myScroll.on('scrollStart', function() {
            _this.scrollStart(this);
        });

        // 监听iscroll scrollEnd事件
        myScroll.on('scrollEnd', function() {
            _this.scrollEnd(this);
        });

        myScroll.on('scroll', function() {
            _this.scroll(this);
        });

        this.setState({myScroll : myScroll});
    },

    /**
     * 初始化wrapper高度
     * @private
     */
    _initWrapperHeight() {
        let wrapperElement = ReactDOM.findDOMNode(this.refs.scroll_wrapper),
            bodyElementHeight = document.documentElement.clientHeight || document.body.clientHeight,
            wrapperHeight;

        wrapperHeight = bodyElementHeight - wrapperElement.offsetTop;
        this.setState({wrapperHeight : wrapperHeight + 'px'}, () => {

            /**
             * slider高度设置完成之后才能初始化scroll
             * 避免不能滑动
             */

            this._initScroll();
        });
    },

    /**
     * 初始化scroll文字
     * @private
     */
    _initScrollText() {
        let { upText, downText, loadingText, completeText } = this.props;

        this.setState({
            upShowText : upText || this.state.upText,
            downShowText : downText || this.state.downText,
            downText : downText || this.state.downText,
            upText : upText || this.state.upText,
            loadingText : loadingText || this.state.loadingText,
            completeText : completeText || this.state.completeText
        });
    },

    componentDidMount() {
        // 初始化wrapper高度
        this._initWrapperHeight();

        // 初始化scroll文字
        this._initScrollText();
    },

    render() {
        let { wrapperHeight, downTag, downShowText, upTag, upShowText, completeText } = this.state,
            { infinite } = this.props;

        return (
            <div className="scroll-wrapper" ref="scroll_wrapper" style={{height:wrapperHeight}}>
                <div className="scroll">
                    <div className="down-refresh" style={downTag?{display:''}:{display:'none'}}>
                        {downShowText}
                    </div>
                    { this.props.children }
                    <div className="up-load" style={upTag?{display:''}:{display:'none'}}>
                        {infinite ? upShowText : completeText}
                    </div>
                </div>
            </div>
        );
    }
});

export default MyScroll;