import React from 'react';
import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import Snackbar from 'material-ui/Snackbar';
import Billing from './billing';
import Cart from './cart';
import Customer from './customer';
import Shipping from './shipping';

export default class CheckoutComponent extends React.PureComponent {
    constructor(props) {
        super(props);

        this.service = createCheckoutService({
            config: {
                bigpayBaseUrl: 'https://bigpay.integration.zone',
                storeHash: '7xcbg28tsc',
                storeId: 12077240,
                storeName: 'robin.ong+1521680812 testsworthy',
            },
        });

        this.state = { isFirstLoad: true };
    }

    componentDidMount() {
        Promise.all([
            this.service.loadCheckout(),
            this.service.loadShippingCountries(),
            this.service.loadShippingOptions(),
            this.service.loadBillingCountries(),
        ]).then(() => this.setState({ isFirstLoad: false }));

        this.unsubscribe = this.service.subscribe((state) => {
            this.setState(state);
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { checkout, errors, statuses } = this.service.getState();

        if (this.state.isFirstLoad) {
            return (
                <Snackbar
                    anchorOrigin={ { vertical: 'top', horizontal: 'center' } }
                    open={ true }
                    message="Loading..."/>
            );
        }

        return (
            <section>
                { statuses.isPending() &&
                    <Snackbar
                        anchorOrigin={ { vertical: 'top', horizontal: 'center' } }
                        open={ true }
                        message="Loading..."/>
                }

                <Cart cart={ checkout.getCart() }/>

                <Customer
                    customer={ checkout.getCustomer() }
                    error={ errors.getSignInError() }
                    onSignIn={ (credentials) => this.service.signInCustomer(credentials) }
                    onSignOut={ () => this.service.signOutCustomer() }/>

                <Shipping
                    address={ checkout.getShippingAddress() }
                    countries={ checkout.getShippingCountries() }
                    options={ checkout.getShippingOptions() }
                    selectedOptionId={ checkout.getSelectedShippingOption() ? checkout.getSelectedShippingOption().id : '' }
                    onSelect={ (addressId, optionId) => this.service.selectShippingOption(addressId, optionId) }
                    onUpdate={ (address) => this.service.updateShippingAddress(address) } />

                <Billing
                    address={ checkout.getBillingAddress() }
                    countries={ checkout.getBillingCountries() }
                    onUpdate={ (address) => this.service.updateBillingAddress(address) } />
            </section>
        );
    }
}