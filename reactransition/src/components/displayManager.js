import React from "react";

import Display from './display';
import Panel3 from "./panel3";

class DisplayManager extends React.Component {
    getCoordinate = (e) => {
        let targetRect = e.target.getBoundingClientRect();
        let xCoord = (e.clientX - targetRect.left)/e.target.width;
        if(xCoord) {
            this.setState({
                interpolationIndex: parseInt(xCoord * this.props.interpolatedList.length),
            }, () => this.forceUpdate());
        }
    };
    changeToMouseMove = () => {
        clearInterval(this.setInterval);
        this.setState({
            mouseMoveFunc : this.getCoordinate,
            changeFunc    : this.changeToAutomatic.bind(this),
            inCircleP     : 'MouseMove',
        })
    };
    changeToAutomatic = () => {
        this.setInterval = setInterval(this.changeDisplay2Img,
            this.state.imageChangeCycle/this.props.interpolatedList.length*1000
        );
        this.setState({
            mouseMoveFunc : ()=>{},
            changeFunc    : this.changeToMouseMove.bind(this),
            inCircleP     : 'Automatic',
        })
    };
    changeDisplay2Img = () => {
        this.setState({interpolationIndex : this.state.interpolationIndex+1,},()=>this.forceUpdate());
    };
    startDisplayShow = () => {
        clearInterval(this.setInterval);
        if (this.state.inCircleP == 'Automatic') {
            this.setInterval = setInterval(this.changeDisplay2Img,
                this.state.imageChangeCycle/this.props.interpolatedList.length*1000
            );
        }
    };
    setImageChangeCycle = (imageChangeCycle) => {
        clearInterval(this.setInterval);
        this.setState({imageChangeCycle : imageChangeCycle,},()=>this.changeToAutomatic());
    };
    setDoTurn = (e) => {
        this.setState({
            doTurn : e.target.checked,

        })
    };
    constructor (props) {
        super(props);
        this.state = {
            interpolationIndex : 0,
            imageChangeCycle   : 10,  // (s)
            mouseMoveFunc      : ()=>{},
            changeFunc         : this.changeToMouseMove.bind(this),
            inCircleP          : 'Automatic',
            doTurn             : false,
        };
        this.setInterval = undefined;
    }
    componentWillMount() {
        this.setState({
            iconNameList : this.props.iconNameList,
            tagNameList  : this.props.tagNameList,
            nVertexes    : this.props.nVertexes,
            colorList    : this.props.colorList,
            downloadFunc : this.props.downloadFunc,
        })
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            return true
        } else {
            return false
        }
    }
    render () {
        let interpolatedImg, interpolatedImgData, tagName, coefficients, listIndex;
        if (this.props.interpolatedList[0]) {
            if(this.state.doTurn) {
                listIndex = this.state.interpolationIndex%(this.props.interpolatedList.length*2);
                if (listIndex>=this.props.interpolatedList.length) {
                    listIndex = this.props.interpolatedList.length*2 - listIndex -1;
                }
            } else {
                listIndex = this.state.interpolationIndex%this.props.interpolatedList.length;
            }
            interpolatedImg = this.props.interpolatedList[listIndex];

            interpolatedImgData = interpolatedImg.split('/').slice(-1)[0].split(',');
            tagName = interpolatedImgData[0];
            coefficients = interpolatedImgData[1].split(';').map((str)=>{
                return Number(str.replace('.jpg',''))
            })
        }
        return (
            <>
                <Panel3 ref='panel3'
                        tagName={tagName}
                        grid={this.props.grid}
                        coefficients={coefficients}
                        inCircleP={this.state.inCircleP}
                        changeFunc={this.state.changeFunc}
                        tagNameList={this.state.tagNameList}
                        iconNameList={this.state.iconNameList}
                        nVertexes={this.state.nVertexes}
                        colorList={this.state.colorList}
                        downloadFunc={this.state.downloadFunc}
                        setImageChangeCycle={this.setImageChangeCycle}
                        setDoTurn={this.setDoTurn}/>
                <Display grid={this.props.grid}
                         imgSrc={interpolatedImg}
                         loading={this.props.loading}
                         selectImg={this.props.selectImg}
                         uploadFunction={()=>{return false;}}
                         mouseMoveFunc={this.state.mouseMoveFunc}/>
            </>
        )
        // Panel3コンポーネント内に処理すべき情報は入ってるので、propsは2つだけでいいようにしてる
    };
}

export default DisplayManager;
