import React from "react";
import Bar from './bar';
import Polygon from './polygon'
import RangeValue from "./rangeValue";

require('./panel1.css');

const CW = 128;
const CH = 128;

class Panel1 extends React.Component {
    setStyle = (gs, nIconNames) => {
        this.setState({
            style            : {
                height       : gs*19,
                fontSize     : gs*0.5,
            },
            rangeValueMargin : gs*(6.9/(nIconNames+1)-1)
        });
    };
    getCoordinates = (nVertex) => {
        this.polygonVertexes = this.getPolygonVertexes(nVertex);
        return this.polygonVertexes.map((i)=>{
            return i.map((j)=>{
                return (j+0.5)*CW
            })
        });
    };
    getPolygonVertexes = (nVertex) => {
        let coordinateList = [];
        for (let i=0; i<nVertex; i++) {
            let x = Math.sin((2*i/nVertex+1)*Math.PI)/6*2;
            let y = Math.cos((2*i/nVertex+1)*Math.PI)/6*2;
            coordinateList.push([x,y])
        }
        return coordinateList
    };
    selectTag = (selectNum) => {
        let selectedList = (new Array(3)).fill(true);
        selectedList[selectNum] = false;
        this.setState({
            selected         : selectedList,
            tagName          : this.state.tagNameList[selectNum],
            coordList        : this.getCoordinates(this.state.nVertexes[selectNum]),
            iconNames        : this.state.iconNameList[selectNum],
            coefficients     : (new Array(this.state.nVertexes[selectNum])).fill(0.5),
            rangeValueMargin : this.props.grid*(6.9/(this.state.iconNameList[selectNum].length+1)-1)
        });
    };
    valueChange = (e) => {
        let coefficients = this.state.coefficients;
        coefficients[e.target.id] = e.target.value*0.01;
        this.setState({coefficients : coefficients});
        let coefficientsSum = 0;
        for (let coefficient of coefficients) {
            coefficientsSum += coefficients
        }
        if (coefficientsSum>1) {
            for (let i in coefficients) {
                coefficients[i] = parseInt(coefficients[i] * 100 / coefficientsSum) / 100
            }
        }

        let fd = new FormData();
        fd.append('tag_name', this.state.tagName);
        fd.append('icon_names', this.state.iconNames.join(';'));
        fd.append('coefficients', this.state.coefficients.map((i)=>{
            return i.toString();
        }).join(';'));
        return this.props.transferRequest(fd);
    };
    constructor (props) {
        super(props);
        this.state = {selected : [false, true, true],};
    }
    componentWillMount () {
        this.setState({
            tagName      : this.props.tagNameList[0],
            tagNameList  : this.props.tagNameList,
            nVertexes    : this.props.nVertexes,
            iconNameList : this.props.iconNameList,
            coordList    : this.getCoordinates(this.props.nVertexes[0]),
            coefficients : (new Array(this.props.nVertexes[0])).fill(0.5),
            iconNames    : this.props.iconNameList[0],
        });
        this.setStyle(this.props.grid, this.props.iconNameList[0].length);
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.setStyle(this.props.grid, this.state.iconNames.length);
            return true
        } else {
            return false
        }
    }
    render () {
        let barList = [];
        for (let i=0; i<this.state.tagNameList.length; i++) {
            barList.push(
                <Bar id={i}
                     panel={1}
                     key={i.toString()}
                     grid={this.props.grid}
                     tag={this.state.tagNameList[i]}
                     selected={this.state.selected[i]}
                     clickFunc={this.selectTag.bind(this)} />
            )
        }
        let polygonVertexes = this.polygonVertexes;
        let canvasProps = {
            grid         : this.props.grid,
            CW           : CW,
            CH           : CH,
            updateCanvas : (ctx) => {
                let vertexList = (function (coefficients) {
                    let return_list = [];
                    for (let i in polygonVertexes) {
                        return_list.push(polygonVertexes[i].map((j)=>{
                            return (j*coefficients[i]+0.5)*CW
                        }))
                    }
                    return return_list
                })(this.state.coefficients);
                let coordList  = this.state.coordList;
                let iconNames  = this.state.iconNames;
                ctx.clearRect(0, 0, CW, CH);
                for (let i in coordList) {
                    const image = new Image();
                    image.onload = () => {
                        ctx.drawImage(image,
                            coordList[i][0]-CW/12, coordList[i][1]-CH/12, CW/6, CH/6);
                    };
                    image.src = '/static/pictures/icons/' + iconNames[i] + '.png';
                }
                ctx.strokeStyle = 'gray';
                for (let coord of coordList) {
                    ctx.beginPath();
                    ctx.moveTo(CW/2, CH/2);
                    ctx.lineTo(coord[0], coord[1]);
                    ctx.stroke();
                }
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(coordList.slice(-1)[0][0], coordList.slice(-1)[0][1]);
                for (let i in coordList) {
                    ctx.lineTo(coordList[i][0], coordList[i][1]);
                }
                ctx.stroke();
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                ctx.moveTo(vertexList.slice(-1)[0][0], vertexList.slice(-1)[0][1]);
                for (let i in vertexList) {
                    ctx.lineTo(vertexList[i][0], vertexList[i][1]);
                }
                ctx.stroke();
            },
        };
        let rangeList = [];
        for (let i in this.state.coefficients) {
            rangeList.push(
                <RangeValue id={i}
                            panel={1}
                            grid={this.props.grid}
                            key={this.state.iconNames[i]}
                            iconNames={this.state.iconNames[i]}
                            margin={this.state.rangeValueMargin}
                            defaultValue={this.state.coefficients[i]}
                            valueChange={this.valueChange.bind(this)} />
            );
        }
        return (
            <div style={this.state.style} className={'panel1'}>
                {barList}
                <Polygon {...canvasProps} />
                {rangeList}
            </div>
        )
    }
}

export default Panel1;
