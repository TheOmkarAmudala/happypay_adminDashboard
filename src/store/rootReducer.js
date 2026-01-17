import { combineReducers } from 'redux'
import theme from './slices/themeSlice'
import auth from './slices/authSlice'
import profile from './slices/profileSlice'


const rootReducer = (asyncReducers) => (state, action) => {
    const combinedReducer = combineReducers({
        theme,
        auth,
        profile,
        ...asyncReducers,
    })
    return combinedReducer(state, action)
}
  
export default rootReducer
