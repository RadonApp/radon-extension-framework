import React from 'react';


export default class OptionComponent extends React.Component {
    get id() {
        return this.props.item && this.props.item.id;
    }

    get plugin() {
        return this.props.item && this.props.item.plugin;
    }

    get preferences() {
        return this.props.item && this.props.item.preferences;
    }
}

OptionComponent.defaultProps = {
    item: null
};
