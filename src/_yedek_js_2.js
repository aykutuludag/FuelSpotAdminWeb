import React, { Component } from 'react';
import logo from './user-image.svg';
import './App.css';



const STATIONS = {};




















class ProductCategoryRow extends Component {
    render() {
        const category = this.props.category;
        return (
            <tr>
                <th colSpan="2">
                    {category}
                </th>
            </tr>
        );
    }
}




class ProductRow extends Component {
    render() {
        const product = this.props.product;
        const name = product.stocked ?
            product.name :
            <span style={{color: 'red'}}>
        {product.name}
      </span>;

        return (
            <tr>
                <td>{name}</td>
                <td>{product.price}</td>
            </tr>
        );
    }
}




class ProductTable extends Component {
    render() {
        const filterText = this.props.filterText;
        const inStockOnly = this.props.inStockOnly;

        const rows = [];
        let lastCategory = null;

        this.props.products.forEach((product) => {
            if (product.name.indexOf(filterText) === -1) {
                return;
            }
            if (inStockOnly && !product.stocked) {
                return;
            }
            if (product.category !== lastCategory) {
                rows.push(
                    <ProductCategoryRow
                        category={product.category}
                        key={product.category} />
                );
            }
            rows.push(
                <ProductRow
                    product={product}
                    key={product.name}
                />
            );
            lastCategory = product.category;
        });

        return (
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}



class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
        this.handleInStockChange = this.handleInStockChange.bind(this);
    }

    handleFilterTextChange(e) {
        this.props.onFilterTextChange(e.target.value);
    }

    handleInStockChange(e) {
        this.props.onInStockChange(e.target.checked);
    }

    render() {
        return (
            <form>
                <input
                    type="text"
                    placeholder="Search..."
                    value={this.props.filterText}
                    onChange={this.handleFilterTextChange}
                />
                <p>
                    <input
                        type="checkbox"
                        checked={this.props.inStockOnly}
                        onChange={this.handleInStockChange}
                    />
                    {' '}
                    Only show products in stock
                </p>
            </form>
        );
    }
}







function StartPanel2() {
    return (
        <div>
            <h1>KAPAK</h1>
        </div>

    );
}











class Button extends Component {

    constructor (props) {
        super(props);
        this.state = {};
    }

    addPanel(panel) {
        this.props.viewChange(panel);
    }

    getList(props) {
        this.addPanel(<StationsByCountry/>);
    }

    render() {
        return (
            <button onClick={() => this.getList(this.props)}>{this.props.name}</button>
        )
    }

}













class Fetch extends Component {
    constructor (props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        };

    }

    addPanel(panel) {
        this.props.viewChange(panel);
    }

    fetchUrl(props) {

        console.log(props);

        var url = props.url;
        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
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
                    console.log(result);
                    this.addPanel(<StartPanel/>);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                    console.log(error);
                }
            )

    }


    render () {

        return (
            <button onClick={() => this.fetchUrl(this.props)}>{this.props.name}</button>
        )
    }
}




const views = [];



function StationsByCountry() {
    return (
        <div>
            <Fetch
                url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php"
                param="country=TR"
                name="Türkiye"
            />
            <button onClick={() => this.addPanel(<StartPanel/>)}>Amerika</button>
            <button>Almanya</button>
            <button>Azerbeycan</button>
            <button>Rusya</button>
        </div>

    );
}




class Panel extends Component {
    constructor (props) {
        super(props);
        this.state = {
            panel: []
        };
        this.getNewPanel = this.getNewPanel.bind(this);

    }

    getNewPanel(panel) {
        this.setState({
            panel: panel
        })
    }


    render () {

        const panel = this.panel;

        return (
            <button onClick={() => this.getNewPanel( <StationsByCountry/>) }>İSTASYONLAR</button>

        )
    }


}






class App extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        return (
            <div>
                <Panel/>
            </div>
        );
    }
}


export default App;















