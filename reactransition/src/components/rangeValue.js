import React from "react";

require('./rangeValue.css');

class RangeValue extends React.Component {
    setStyle = (gs, marginTop) => {
        let isPanel1 = [1, 3].indexOf(this.props.panel) >= 0;
        let widthPercent = isPanel1 ? '75.07%' : '45%';
        let fontSizeRate = isPanel1 ? 0.5 : 0.4;
        let marginLeftPercent = isPanel1 ? '12.4%' : '2%';
        let rangeValueTop = isPanel1 ? '4.125%' : '2.12%';
        this.setState({
            style          : {
                marginTop  : marginTop,
                fontSize   : gs*fontSizeRate,
                width      : widthPercent,
                marginLeft : marginLeftPercent,
            },
            rangeValueTop  : {
                marginTop  : rangeValueTop,
            }
        })
    };
    constructor (props) {
        super(props);
        this.state = {
            value : this.props.defaultValue
        }
    }
    componentDidMount () {
    }
    componentWillMount () {
        this.setStyle(this.props.grid, this.props.margin);
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.setStyle(this.props.grid, this.props.margin);
            return true
        } else {
            return false
        }
    }
    render () {
        let rangeValue, input;
        if (this.props.panel==1) {
            input = (
                <input min={0}
                       max={100}
                       type={'range'}
                       id={this.props.id}
                       defaultValue={this.props.defaultValue*100}
                       className={'coefficientRange'}
                       onChange={(e)=>{
                           this.setState({
                               value : e.target.value/100,
                           }, ()=>this.forceUpdate());
                       }}
                       onMouseUp={(e)=>{this.props.valueChange(e);}}/>
               );
            rangeValue = Math.round(this.state.value*100)/100;
        } else {
            input = (
                <input min={0}
                       max={100}
                       readOnly
                       type={'range'}
                       id={this.props.id}
                       value={this.props.value*100}
                       className={'coefficientRange'}/>
               );
            rangeValue = Math.round(this.props.value*100)/100;
        }
        return (
          <div style={this.state.style}
               className={'rangeValueDiv'}>
               <img className={'icon'}
                    style={this.state.imgStyle}
                    src={'/static/pictures/icons/'+this.props.iconNames + '.png'}/>
              {input}
               <p className={'rangeValue'}
                  style={this.state.rangeValueTop}>
                   {rangeValue}
               </p>
          </div>
        )
    };
}

export default RangeValue;
