// TODO: shrink card sizes on mobile

const s3_address = 'https://tarot-spa.s3.us-east-1.amazonaws.com/'

const rider_waite = [[
  ... A.range (0) (21),
  ... F.p (['W', 'S', 'C', 'P']) (
    A.map (h => A.map (h2 => h2 + h) ([... A.range (1) (10), 'P', 'N', 'Q', 'K']))
    >> A.reduce (A.append)
  ),
], 'images/cards/rider-waite/']

const thoth = [[
  ... A.range (0) (21),
  ... F.p (['W', 'S', 'C', 'P']) (
    A.map (h => A.map (h2 => h2 + h) ([... A.range (1) (10), 'S', 'Q', 'P', 'K']))
    >> A.reduce (A.append)
  ),
], 'images/cards/thoth/']

// greenwood deck

module.exports = sources => {
  var {DOM: DOM} = sources

  const throw_cards = 'throw_cards'
  const clear_throw = 'clear_throw'
  const clear_spread = 'clear_spread'
  const reversals = 'reversals'
  const mat = 'mat'

  const ctrl_panel_height = 35

  const card_height = 208
  const card_width = 120

  const fullsize = window.screen.width > 600

  var get_clicks = s => most.from (DOM.select (`#${s}`).events ('click'))

  var thrown$ =
    most.mergeArray ([
      get_clicks (throw_cards).constant (true),
      get_clicks (clear_throw).constant (false),
      get_clicks (clear_spread).constant (false),
    ])
      .startWith (false)

  var placements$ =
    most.merge (
      get_clicks (mat).map (h => [h.x - card_width / 2, h.y - card_height / 2]),
      get_clicks (clear_spread).constant ([]),
    )
      .scan ((a, h) => h.length ? [... a, [h[0], h[1]]] : [], [])

  var reversals$ =
    get_clicks (reversals)
      .map (h => h.target.checked)
      .startWith (false)

  // TODO deck selection (Rider-Waite, Thoth, Wildwood)
  var deck$ = []

  var cards_dom$ =
    most.combineArray ((thrown, placements, reversals) => {
      var shuffle = deck => {
        var ans = []
        var cards = F.p (deck) (
          A.map (h => [h, true])
          >> D.create
        )
        while (ans.length < deck.length) {
          var ks = D.keys (cards)
          var card = ks[Math.floor (Math.random () * ks.length)]
          delete cards[card]
          ans = A.cons (card) (ans)
        }
        return ans
      }

      var deck = shuffle (rider_waite[0]) // TODO deck selection
      var path = rider_waite[1]

      var draw = () => {
        if (thrown && deck.length) {
          var reversed = reversals && Math.random () < .5
          var ans = A.head (deck)
          deck = A.tail (deck)
          return [ans, reversed]
        }
        else {
          return ['back', false]
        }
      }

      return div (A.mapi (i => h => {
        var card = draw ()
        var image = `${s3_address}${path}${thrown ? card[0] : 'back'}.jpg`
        return (
          img (card[1] ? '.reversed' : '.upright', {
            attrs: {src: image},
            style: {
              height: `${fullsize ? card_height : card_height / 2}px`,
              width: `${fullsize ? card_width : card_width / 2}px`,
              position: 'absolute',
              top: `${h[1] - ctrl_panel_height + (fullsize ? 0 : card_height / 4)}px`,
              left:`${h[0] + (fullsize ? 0 : card_width / 4)}px`,
              'z-index': i,
            },
          })
        )
      }) (placements))
    }, [
      thrown$,
      placements$,
      reversals$,
    ])
      .startWith (div ())

  return {
    DOM: (
      most.combineArray ((
        cards_dom,
        thrown,
      ) => {
        return (
          <div style={{height: '100%', width: '100%'}}>
            <button id={throw_cards} style={{width: '100px'}} attrs={thrown ? {disabled: true} : undefined}>Throw</button>
            <button id={clear_throw} style={{width: '100px'}}>Clear Cards</button>
            <button id={clear_spread} style={{width: '100px'}}>Clear Spread</button>
            <input id={reversals} attrs={D.extend ({type: 'checkbox'}) (thrown ? {disabled: true} : {})}>Reversals</input>
            {
              thrown
              ? (
                <div id={'z'} style={{position: 'fixed', top: ctrl_panel_height + 'px', bottom: '0px', left: '0px', right: '0px'}}>
                  {cards_dom}
                </div>
              )
              : (
                <div id={mat} style={{position: 'fixed', top: ctrl_panel_height + 'px', bottom: '0px', left: '0px', right: '0px'}}>
                  {cards_dom}
                </div>
              )
            }
          </div>
        )
      }, [
        cards_dom$,
        thrown$,
      ])
    ),
  }
}
