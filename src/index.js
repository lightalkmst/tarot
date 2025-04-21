import {} from './init.js'
import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import Snabbdom from 'snabbdom-pragma' // necessary
import main from './app.jsx'

run (main, {
  DOM: makeDOMDriver ('#root'),
  // HTTP: makeHTTPDriver (),
})
