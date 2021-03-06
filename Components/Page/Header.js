import React from 'react';

import './Header.scss';


export default class PageHeader extends React.Component {
    render() {
        return (
            <div className="PageHeader expanded row columns">
                <div className="row">
                    <div className="PageHeader-title small-10 columns">
                        <h3>{this.props.title}</h3>

                        {this.props.subtitle}
                    </div>

                    {this.props.children}
                </div>
            </div>
        );
    }
}
