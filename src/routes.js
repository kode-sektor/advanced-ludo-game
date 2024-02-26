import React from 'react'
import { Route, Routes } from 'react-router-dom'

import App from './components/App'

const routes = () => {
    return (
        <Routes>
            <Route path="/" exact element={<App/>} />
        </Routes>
    )
}

export default routes
