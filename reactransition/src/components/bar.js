import React from "react";

require('./bar.css');

class Bar  extends React.Component {
    setStyle = (gs) => {
        let panel1 = this.props.panel == 1;
        let margin = panel1 ? '12.51% 0 2.25% 12.51%' : '3.57% 3.57% 0 0';
        let width = panel1 ? '75.07%' : '21.42%';
        let float = panel1 ? 'left' : 'right';
        this.setState({
            style             : {
                height        : gs*0.8,
                margin        : margin,
                width         : width,
                float         : float,
            },
        });
    };
    clickFunc = (e) => {
        e.preventDefault();
        e.target.classList.remove('click');
        this.state.clickFunc(this.props.id);
    };
    mouseHover = (e) => {
        e.preventDefault();
        e.target.classList.remove('mouseover');
        e.target.classList.add('mouseleave');
        if (this.props.selected) {
            this.setState({
                barAnim       : {
                    animation : 'hoverBar 0.5s ease 0s forwards'
                },
                tagAnim       : {
                    color     : 'black'
                }
            })
        }
    };
    mouseLeave = (e) => {
        e.preventDefault();
        e.target.classList.remove('mouseleave');
        e.target.classList.add('mouseover');
        if (this.props.selected) {
            this.setState({
                barAnim       : {
                    animation : 'leaveBar 0.5s ease 0s forwards'
                },
                tagAnim       : {
                    color     : 'white'
                }
            })
        }
    };
    constructor (props) {
        super(props);
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.setStyle(this.props.grid);
            return true
        }
        else {
            return false
        }
    }
    componentWillMount () {
        this.setStyle(this.props.grid);
        this.setState({clickFunc : this.props.clickFunc})
    }
    render () {
        let barClass, tagClass;
        if (!this.props.selected) {
            barClass = 'selectedBar';
            tagClass = 'selectedTag';
        } else {
            barClass = 'bar';
            tagClass = 'tag';
        }
        return (
            <div style={this.state.style} className={'barParent'}
                 onClick={this.clickFunc}>
                <div className={barClass} style={this.state.barAnim}>
                    <p className={tagClass} style={this.state.tagAnim}>
                        {this.props.tag}
                    </p>
                </div>
            </div>
        )
    }
}

export default Bar;
