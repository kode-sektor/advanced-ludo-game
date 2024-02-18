import React from 'react'
import { Route, Switch } from 'react-router-dom'

import App from './components/App'

const routes = () => {
    return (
        <Switch>
            <Route path="/" exact component={App} />
        </Switch>
    )
}

export default routes
