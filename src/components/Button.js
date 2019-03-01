import React from "react";
import ReactDOM from "react-dom";
import {buildStationsObject} from "./StationCard";
import {STATIONS} from "../App";

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: false,
            error: null,
            isLoaded: false,
            items: []
        };
    }

    updatePanel(panel) {
        const view = [];
        const domPanel = ReactDOM.findDOMNode(this).closest(".panel");
        const buttonIndex = Array.from(domPanel.parentElement.children).indexOf(domPanel);

        for (let i = 0; i < buttonIndex + 1; i++) {
            view[i] = this.props.geod.title[i];
        }
        view.push(panel);
        this.props.activateGeod({
            title: view
        });
    }

    fetchUrl(props) {
        document.body.classList.add("loading");

        let url = props.url;
        let params = {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: props.param,
            method: "POST"
        };

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });

                    buildStationsObject(result);

                    console.log(STATIONS);

                    document.body.classList.remove("loading");
                    this.updatePanel(this.props.menu);
                }, (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                    document.body.classList.remove("loading");
                    alert("Veritabanı çekilemedi." + error);
                }
            )
    }

    render() {
        if (!this.props.menu) {
            return (
                <button className={this.props.class}>{this.props.name}</button>
            )
        }
        if (this.props.size) {
            return (
                <button className={this.props.class} onClick={() => this.updatePanel(this.props.menu)}>
                    {this.props.name}
                    <span className="badge badge-light">{this.props.size}</span>
                </button>
            )
        } else {
            if (!this.props.url) {
                return (
                    <button className={this.props.class}
                            onClick={() => this.updatePanel(this.props.menu)}>{this.props.name}</button>
                )
            } else {
                return (
                    <button className={this.props.class}
                            onClick={() => this.fetchUrl(this.props)}>{this.props.name}</button>
                )
            }
        }
    }
}

export default Button