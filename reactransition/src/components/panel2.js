import React from "react";
import RangeValue from "./rangeValue";
import Bar from "./bar";

require('./panel2.css');

class Panel2 extends React.Component {
    setStyle = (gs) => {
        this.setState({
            style        : {
                height   : gs*6,
                fontSize : gs*0.5,
            },
            inputStyle   : {
                height   : gs*0.6,
            }
        })
    };
    dragOver = (e) => {
        e.preventDefault();
        e.target.classList.add('dragover');
    };
    dragLeave = (e) => {
        e.preventDefault();
        e.target.classList.remove('dragover');
    };
    dropImg = (e) => {
        e.preventDefault();
        e.target.classList.remove('dragenter');
        let img_metadata = this.props.setImg(e);
        let imgName, iconNames, coeffs;
        let newImgMetaLists = JSON.parse(JSON.stringify(this.state.imgMetaLists));
        let createNewRanges = () => {
            return new Promise((resolve, reject)=>{
                imgName = img_metadata.split('/').slice(-2)[0];
                img_metadata = img_metadata.split('/').slice(-1)[0].split(',');
                iconNames = this.state.iconNameList[this.state.tagNameList.indexOf(img_metadata[0])];
                coeffs = img_metadata[1].split(';').map((i) => {
                    return Math.round(parseFloat(i.replace('.jpg', '')) * 100) / 100
                });
                newImgMetaLists[e.target.id] = {
                    imgName   : imgName,
                    iconNames : iconNames,
                    coeffs    : coeffs,
                };
            }).catch((e) => {
                console.log(e);
            });
        };
        let setNewRanges = function (_this) {
            return new Promise((resolve, reject) => {
                _this.setState({
                    imgMetaLists : newImgMetaLists,
                },()=>_this.forceUpdate());
            })
        };
        return createNewRanges().then(setNewRanges(this))
    };
    setDivisionValue = (e) => {
        let value = Number(e.target.value);
        if (!value || value<1 || value>100) {
            alert('Please fill number between 1 and 100!!');
            e.target.value = this.state.division;
            return false;
        }
        this.setState({
            division : value,
        })
    };
    interpStart = () => {
        if (this.state.interpButton) {
            this.setState({
                interpButton: false
            });
            let iML = this.state.imgMetaLists.imgMetaList0;
            this.props.interpRequest(this.state.division, iML.imgName, iML.iconNames.join(';'));
        }
    };
    interpEnd = () => {
        this.setState({
            interpButton : true
        },()=>this.forceUpdate());
    };
    constructor (props) {
        super(props);
        this.state = {
            imgMetaLists            : {
                imgMetaList0    : {
                    imgName   : '',
                    iconNames : [],
                    coeffs    : [0],
                },
                imgMetaList1    : {
                    imgName   : '',
                    iconNames : [],
                    coeffs    : [0],
                },
            },
            interpButton      : true,
            division          : 10,
        }
    }
    componentWillMount () {
        this.setStyle(this.props.grid);
        this.setState({
            tagNameList  : this.props.tagNameList,
            iconNameList : this.props.iconNameList,
        })
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.setStyle(this.props.grid);
            return true
        } else {
            return false
        }
    }
    render () {
        let rangeLists = [];
        let imgMetaLists = this.state.imgMetaLists;
        for (let key in imgMetaLists) {
            let rangeList = [];
            let rangeMargin = this.props.grid*1.3/(imgMetaLists[key].iconNames.length+1)-1;
            for (let i in imgMetaLists[key].iconNames) {
                if (imgMetaLists[key].iconNames[i]) {
                    rangeList.push(
                        <RangeValue id={i}
                                    key={i}
                                    panel={2}
                                    margin={rangeMargin}
                                    grid={this.props.grid}
                                    value={imgMetaLists[key].coeffs[i]}
                                    iconNames={imgMetaLists[key].iconNames[i]}/>
                    );
                }
            }
            rangeLists.push(rangeList)
        }
        let interpolationTool;
        if (imgMetaLists.imgMetaList0.iconNames.length!=0 &
            (imgMetaLists.imgMetaList0.iconNames.join(';')==imgMetaLists.imgMetaList1.iconNames.join(';'))){
            if(imgMetaLists.imgMetaList0.imgName == imgMetaLists.imgMetaList1.imgName){
                interpolationTool = (
                    <>
                        <div className={'divisionDiv'}>
                              <p className={'divisionP'}>Division(max100)</p>
                              <input type={'text'}
                                     defaultValue={10}
                                     style={this.state.inputStyle}
                                     className={'divisionInput'}
                                     onBlur={this.setDivisionValue}/>
                        </div>
                        <Bar id={'1'}
                             panel={2}
                             tag={'Interpolation'}
                             grid={this.props.grid}
                             selected={this.state.interpButton}
                             clickFunc={this.interpStart}/>
                    </>
                )
            } else {
                interpolationTool = (
                    <p className={'alertP'}>
                        Please drop images transferred from same image!
                    </p>
                )
            }
        }
        return (
              <div className={'panel2'}
                   style={this.state.style}>
                  <div className={'interpolationFrom'}>
                      <div className={'imgDiv'}>
                          <img id={'imgMetaList0'}
                               className={'interpImg'}
                               src={this.props.fromImgSrc}
                               onDrop={(e)=>{this.dropImg(e);}}
                               onDragOver={(e)=>{this.dragOver(e);}}
                               onDragLeave={(e)=>{this.dragLeave(e);}}/>
                      </div>
                      {rangeLists[0]}
                  </div>
                  <div className={'interpolationFrom'}>
                      <div className={'imgDiv'}>
                          <img id={'imgMetaList1'}
                               className={'interpImg'}
                               src={this.props.toImgSrc}
                               onDrop={(e)=>{this.dropImg(e)}}
                               onDragOver={(e)=>this.dragOver(e)}
                               onDragLeave={(e)=>{this.dragLeave(e)}}/>
                      </div>
                      {rangeLists[1]}
                  </div>
                  {interpolationTool}
              </div>
        )
    };
}

export default Panel2;
