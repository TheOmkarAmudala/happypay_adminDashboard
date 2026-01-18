import { combineReducers } from 'redux'
import theme from './slices/themeSlice'
import auth from './slices/authSlice'
import profile from './slices/profileSlice'
import customers from './slices/customerSlice'


const rootReducer = (asyncReducers) => (state, action) => {
    const combinedReducer = combineReducers({
        theme,
        auth,
        profile,
        customers,
        ...asyncReducers,
    })
    return combinedReducer(state, action)
}
  
export default rootReducer
