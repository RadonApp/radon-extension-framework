import React from 'react';

import './Header.scss';


export default class PageHeader extends React.Component {
    render() {
        return (
            <div className="PageHeader columns">
                <div className="row">
                    <div className="PageHeader-title small-10 columns">
                        <h3>{this.props.title}</h3>
                    </div>

                    {this.props.children}
                </div>
            </div>
        );
    }
}
