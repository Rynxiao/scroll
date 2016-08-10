/**
 * Created by Ryn on 2016/8/7.
 * 入口文件
 */

import '../style/style.css';

import React from 'react';
import ReactDOM from 'react-dom';
import MyScroll from '../components/MyScroll';

const App = React.createClass({

    getInitialState() {
        return {
            list : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            newList : [],
            page : 1
        }
    },

    _getData(page) {
        if (page < 3) {
            let list = [];
            for (let i = 0; i < 10; i++) {
                list.push(i);
            }
            return list;
        } else {
            return [];
        }
    },

    componentDidMount() {
        let { newList, page } = this.state;
        newList = this._getData(page);
        this.setState({newList : newList});

    },

    onRefresh(callback) {
        let { list } = this.state;
        setTimeout(() => {
            this.setState({newList : list, page : 1}, () => {
                callback();
            });
        }, 800);
    },

    onPullLoad(callback) {
        let { newList, page } = this.state;

        this.setState({page : page + 1}, () => {
            setTimeout(() => {
                newList = newList.concat(this._getData(page));
                this.setState({newList : newList}, () => {
                    callback();
                });
            }, 800);
        });
    },

    render() {
        let { newList } = this.state;
        return (
            <div className="s-container">
                <div className="padding"></div>
                <MyScroll
                    upText="shang hua"
                    downText="下 la"
                    loadingText="快点出来啊。。。"
                    completeText="加载完成咯"
                    infinite={newList.length < 30}
                    onPullLoad={this.onPullLoad}
                    onRefresh={this.onRefresh}>
                    <ul className="scroll-content">
                        {
                            newList.map((l, index) => {
                                return (<li key={'l'+index}>li {l}</li>);
                            })
                        }
                    </ul>
                </MyScroll>
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('slider')
);

