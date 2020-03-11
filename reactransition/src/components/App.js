import React from "react";
import throttle from 'react-throttle-render';

import Header   from './header';
import Display from './display';
import Panel1  from './panel1';
import Panel2 from './panel2';
import DisplayManager from './displayManager';

// 各panelのコードに埋め込まれているラベルとかの情報をpropsで渡す形でAppに全部書けるようにする
// Circleの色調整
//

class App extends React.Component {
    getCoordinate = (e) => {
        let xCoord = e.clientX - window.innerWidth/ 6*5;
        let yCoord = e.clientY - window.innerWidth/15*9;
        // if (Math.abs(xCoord)<window.innerWidth/6 && Math.abs(yCoord)<window.innerWidth/3) {
        //     this.setState({})
        // }
    };
    reRender = () => {
        this.setState({});
    };
    uploadImg = () => {
        let fd = new FormData(document.forms[0]);
        let csrftoken = document.forms[0].children[0].value;
        return fetch('api/upload', {
            method : 'POST',
            body   : fd,
            headers: {"X-CSRFToken": csrftoken},
        }).then((response)=>{return(response.json())}).then((response)=>{
            this.setState({
                originImg      : '/static/pictures/origin/' + response.title,
                transferredImg : '/static/pictures/origin/' + response.title,
            });
        }).catch((e) => {
            console.log(e);
        });
    };
    selectImg = (logImgSrc) => {
        this.interpImgBuffer = logImgSrc;
    };
    setImg = (e) => {
        this.setState({
            [e.target.id] : this.interpImgBuffer
        });
        return this.interpImgBuffer;
    };
    transferRequest = (fd) => {
        if (this.transferring) {
            return null;
        }else{
            if (this.state.originImg != '') {
                this.transferring = true;
                this.setState({
                    transferring : true
                });
                let originName = this.state.originImg.replace('/static/pictures/origin/', '');
                let csrftoken = document.forms[0].children[0].value;
                fd.append('title', originName);
                return fetch('api/transfer', {
                    method  : 'POST',
                    body    : fd,
                    headers : {"X-CSRFToken": csrftoken},
                }).then((response) => {
                    return (response.json())
                }).then((response) => {
                    this.transferring = false;
                    let newImgPath = '/static/pictures/' + originName + '/' + response.filename;
                    let headerImgList = JSON.parse(JSON.stringify(this.state.headerImgList));
                    headerImgList.push(newImgPath);
                    this.setState({
                        transferredImg : newImgPath,
                        headerImgList  : headerImgList,
                        transferring   : false,
                    });
                }).catch((e) => {
                    console.log(e);
                });
            }
        }
    };
    interpRequest = (division, imgName, iconNames) => {
        if (this.interpolating) {
            return null;
        } else {
            this.interpolating = true;
            this.setState({
                interpolating : true,
            });
            let csrftoken = document.forms[0].children[0].value;
            let fd = new FormData();
            fd.append('from_src', this.state.imgMetaList0.split('/').slice(-1)[0]);
            fd.append('to_src', this.state.imgMetaList1.split('/').slice(-1)[0]);
            fd.append('division', division);
            fd.append('img_name', imgName);
            fd.append('icon_names', iconNames);
            return fetch('api/interp', {
                method  : 'POST',
                body    : fd,
                headers : {"X-CSRFToken" : csrftoken},
            }).then((response) => {
                return (response.json())
            }).then((response) => {
                this.interpolating = false;
                this.setState({
                    interpolating    : false,
                    interpolatedList : response.filenameList.map((filename)=>{
                        return '/static/pictures/' + imgName + '/' + filename
                    })
                });
                this.refs.displayManager.startDisplayShow();
                this.refs.panel2.interpEnd();
            }).catch((e) => {
                console.log(e);
            });
        }
    };
    downloadRequest = () => {
        if (this.downloading) {
            return null;
        } else {
            this.downloading = true;
            this.setState({
                downloading : true,
            });
            let csrftoken = document.forms[0].children[0].value;
            let fd = new FormData();
            fd.append('interpolatedList', this.state.interpolatedList.join('#'));
            console.log(this.refs.displayManager.state.imageChangeCycle);
            fd.append('periodicTime', this.refs.displayManager.state.imageChangeCycle);
            fd.append('doTurn', this.refs.displayManager.state.doTurn);
            return fetch('api/download', {
                method  : 'POST',
                body    : fd,
                headers : {"X-CSRFToken" : csrftoken},
            }).then((response) => {
                return (response.json())
            }).then((response) => {
                let downloader = document.createElement('a');
                downloader.href = response.video_path;
                downloader.download = response.video_path;
                downloader.click();
                this.downloading = false;
                this.setState({
                    downloading    : false,
                });
                this.refs.displayManager.refs.panel3.downloadEnd();
            }).catch((e) => {
                console.log(e);
            });
        }
    };
    constructor (props) {
        super(props);
        this.state = {
            originImg        : '',
            transferredImg   : '',
            interpolatedList : [],
            display2ImgCycle : 10,
            headerImgList    : [],
            transferring     : false,
            interpolating    : false,
            downloading      : false,
            imgMetaList0     : '',   // 実態はsrc
            imgMetaList1     : '',   //    ``
            tagNameList      : ['SEASONS', 'PAINTINGS', 'PoD'],
            iconNameList     : [
                ['spring', 'summer', 'autumn', 'winter'],
                ['romanticism', 'impressionism', 'vangogh', 'redon', 'ukiyoe'],
                ['day', 'evening', 'night']
            ],
            colorList        : [
                ['#eb6ea5', '#00a0a0', '#c04020', '#f0f0f0'],
                ['#372b25', '#cad4d8', '#c0ae37', '#ab3638', '#d8c0a2'],
                ['#ffffe0', '#ff8c00', '#000080'],
            ],
        };
        this.transferring = false;
        this.interpolating = false;
        this.interpImgBuffer = '';
    }
    componentDidMount () {
        // mousemoveイベントでもいいけど、
        // 高頻度イベントなので処理負荷のためにsetInterval(100)とかで軽減してもいいかも
        document.body.addEventListener("mousemove", (e) => {
            this.getCoordinate(e);
        });
        window.addEventListener('resize', () => {
            this.reRender();
        });
        window.addEventListener('click', () => {
            this.reRender();
        })
    }
    componentWillMount () {
        document.body.removeEventListener("mousemove", (e) => {
            this.getCoordinate(e)
        });
        window.removeEventListener('resize', () => {
            this.reRender()
        });
        window.removeEventListener('click', () => {
            this.reRender()
        })
    }
    render () {
        let grid_side = window.innerWidth/30;
        let nVertexes = this.state.iconNameList.map((list)=>{return list.length});
        return (
          <>
              <Header grid={grid_side}
                      uploadFunction={this.uploadImg}
                      orgImgSrc={this.state.originImg}
                      logImgs={this.state.headerImgList}
                      selectImg={this.selectImg}/>
              <Display grid={grid_side}
                       selectImg={this.selectImg}
                       imgSrc={this.state.transferredImg}
                       loading={this.state.transferring}
                       uploadFunction={this.uploadImg}/>
              <Panel1 grid={grid_side}
                      imgName={this.state.originImg}
                      transferRequest={this.transferRequest}
                      tagNameList={this.state.tagNameList}
                      nVertexes={nVertexes}
                      iconNameList={this.state.iconNameList}/>
              <Panel2 ref='panel2'
                      grid={grid_side}
                      setImg={this.setImg}
                      interpRequest={this.interpRequest}
                      toImgSrc={this.state.imgMetaList1}
                      fromImgSrc={this.state.imgMetaList0}
                      tagNameList={this.state.tagNameList}
                      iconNameList={this.state.iconNameList}/>
              <DisplayManager ref='displayManager'
                              grid={grid_side}
                              selectImg={this.selectImg}
                              loading={this.state.interpolating}
                              interpolatedList={this.state.interpolatedList}
                              tagNameList={this.state.tagNameList}
                              iconNameList={this.state.iconNameList}
                              nVertexes={nVertexes}
                              colorList={this.state.colorList}
                              downloadFunc={this.downloadRequest}/>
          </>
        )
    };
}

export default App;
