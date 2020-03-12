import React from "react";
import Bar from './bar';
import RangeValue from "./rangeValue";

require('./panel3.css');

class Panel3 extends React.Component {
    setStyle = (gs, coefficientsLength) => {
        this.setState({
            style            : {
                height       : gs*19,
                fontSize     : gs*0.5,
            },
            rangeValueMargin : gs*(6.9/(coefficientsLength+1)-1)
        });
    };
    downloadStart = () => {
        if (this.state.downloadButton) {
            this.setState({
                downloadButton: false
            });
            this.state.downloadFunc();
        }
    };
    downloadEnd = () => {
        this.setState({
            downloadButton : true
        },()=>this.forceUpdate());
    };
    setPeriodicTime = (e) => {
        let periodicTime = e.target.value;
        if (!periodicTime || periodicTime<1 || periodicTime>100) {
            alert('Please fill number between 1 and 100.');
            e.target.value = this.state.periodicTime;
            return false;
        }
        this.setState({periodicTime : periodicTime});
        this.props.setImageChangeCycle(periodicTime);
    };
    constructor (props) {
        super(props);
        this.pies = [];
        this.inCircle = null;
        this.state = {
            downloadButton : true,
            periodicTime   : 10,
        };
    }
    componentWillMount () {
        this.setStyle(this.props.grid);
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
            let coefficientsLength = this.props.coefficients ? this.props.coefficients.length : 0;
            this.setStyle(this.props.grid, coefficientsLength);
            return true
        } else {
            return false
        }
    }
    render () {
        let rangeList = [];
        let circleList = [];
        let inCircle = [];
        let bar = [];
        let tagNameIndex = this.state.tagNameList.indexOf(this.props.tagName);
        if (tagNameIndex+1) {
            let coefficientsSum = 0;
            let coefficientsLength = this.props.coefficients.length;
            for (let coefficient of this.props.coefficients) {
                coefficientsSum += coefficient
            }
            let rates = this.props.coefficients.map((coefficient) => {
                return coefficient / coefficientsSum * 100
            });
            let rateSum = 0;
            for (let i in this.props.coefficients) {
                rangeList.push(
                    <RangeValue id={i}
                                panel={3}
                                grid={this.props.grid}
                                key={this.state.iconNameList[tagNameIndex][i]}
                                value={this.props.coefficients[i]}
                                iconNames={this.state.iconNameList[tagNameIndex][i]}
                                margin={this.state.rangeValueMargin}/>
                );

                let strokeDasharray = [];
                let newRateSum;
                if (i == 0) {
                    rateSum = rates[0];
                    strokeDasharray = [rateSum, 100 - rateSum, 0, 0];
                } else if (i == coefficientsLength - 1) {
                    strokeDasharray = [0, rateSum, 100 - rateSum, 0];
                } else {
                    newRateSum = rateSum + rates[i];
                    strokeDasharray = [0, rateSum, rates[i], 100 - newRateSum];
                    rateSum = newRateSum;
                }
                strokeDasharray = strokeDasharray.join(',');
                circleList.push(
                    <circle strokeDasharray={strokeDasharray}
                            ref={node => this.pies[i+1] = node}
                            key={this.state.colorList[tagNameIndex][i]}
                            stroke={this.state.colorList[tagNameIndex][i]}
                            cx="31.8309886184" cy="31.8309886184" r="15.9154943092"/>
                )
            }
            inCircle.push(
                <div key={'inCircle'}
                     className={'inCircle'}>
                    <p className={'inCircleP'}
                       onClick={this.props.changeFunc}>
                        {this.props.inCircleP}
                    </p>
                    <p className={'periodicTimeP'}>periodic time</p>
                    <input type={'text'}
                           defaultValue={10}
                           style={this.state.inputStyle}
                           className={'periodicTimeInput'}
                           onBlur={this.setPeriodicTime}/>
                    <p className={"turnP"}>turn</p>
                    <input type={"checkbox"}
                           className={"turnInput"}
                           onInput={this.props.setDoTurn}/>
                </div>
            );
            bar.push(
                <Bar id={'1'}
                     panel={1}
                     key={'bar'}
                     tag={'Download'}
                     grid={this.props.grid}
                     selected={this.state.downloadButton}
                     clickFunc={this.downloadStart}/>
            )
        }
        return (
            <div style={this.state.style} className={'panel3'}>
                <div className={'rangeValueDiv'}>
                    {rangeList}
                </div>
                <figure>
                    <svg viewBox="0 0 63.6619772368 63.6619772368">
                        {circleList}
                        <circle key={'centerPie'}
                                className={"centerPie"}
                                cx="31.8309886184" cy="31.8309886184" r="7.9154943092" />
                    </svg>
                </figure>
                {inCircle}
                {bar}
            </div>
        )
    }
}

export default Panel3;
