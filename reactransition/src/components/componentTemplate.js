import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
    setStyle = () => {

    };
    constructor (props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount () {
    }
    componentWillMount () {
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
        return (
          <>
          </>
        )
    };
}

export default App;
