import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class ChangeSet extends Component {

    constructor(props) {
        super(props);
        this.state = { condense: false };
        this.condense = this.condense.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.condense, true);
        this.condense();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.changeSet !== this.props.changeSet) {
            this.condense();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.condense, true);
    }

    condense() {
        const domNode = ReactDOM.findDOMNode(this.refs.authorsWrapper); // used to check for overflow
        if (domNode && domNode.scrollWidth > domNode.clientWidth) {
            this.setState({ condense: true });
        }
    }

    render() {
        const { props: { changeSet, onClick }, state: { condense } } = this;
        const authors = changeSet && changeSet.map ? [...(new Set(changeSet.map(change => change.author.fullName)):any)] : [];
        let children = 'No changes';
        if (authors && authors.length > 0) {
            let nested;
            if (condense) {
                nested = `${this.props.changeSet.length} changes`;
            } else {
                nested = `Changes by ${authors.map(author => ` ${author}`)} `;
            }
            children = (<a className="authors" onClick={onClick}>
               {nested}
            </a>);
        }
        return (<div ref="authorsWrapper">
            {children }
        </div>);
    }
}

const { array, func } = PropTypes;

ChangeSet.propTypes = {
    changeSet: array,
    onClick: func,
};