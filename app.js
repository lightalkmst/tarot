// TODO: shrink card sizes on mobile

const s3_address = 'https://s3.amazonaws.com/modern-tarot/'

const rider_waite = [[
  ... L.range (0) (21),
  ... F.p (['W', 'S', 'C', 'P']) (
    L.map (h => L.map (h2 => h2 + h) ([... L.range (1) (10), 'P', 'N', 'Q', 'K']))
    >> L.reduce (L.append)
  ),
], 'images/cards/rider-waite/']

const thoth = [[
  ... L.range (0) (21),
  ... F.p (['W', 'S', 'C', 'P']) (
    L.map (h => L.map (h2 => h2 + h) ([... L.range (1) (10), 'S', 'Q', 'P', 'K']))
    >> L.reduce (L.append)
  ),
], 'images/cards/thoth/']

// greenwood deck

var main = sources => {
  var {DOM: DOM} = sources

  const add_upright = '#add_upright'
  const throw_cards = '#throw_cards'
  const clear_throw = '#clear_throw'
  const clear_spread = '#clear_spread'
  const clipboard = '#clipboard'
  const reversals = '#reversals'

  const mat = '#mat'

  const ctrl_panel_height = 35

  const card_height = 208
  const card_width = 120

  var serialize = () => {
    var ans = ''
    location.hash = ans
  }

  var deserialize = () => {}

  var get_clicks = s => DOM.select (s).events ('click')

  // TODO figure out how to derive initial spread if url parameter is given

  var time$ = xs.periodic (10)

  var thrown$ =
    xs.merge (... [
      get_clicks (throw_cards).mapTo (true),
      get_clicks (clear_throw).mapTo (false),
      get_clicks (clear_spread).mapTo (false),
    ])
      .startWith (false)

  var placements$ =
    xs.merge (... [
      get_clicks (mat).map (h => [h.x - card_width / 2, h.y - card_height / 2]),
      get_clicks (clear_spread).mapTo ([]),
    ])
      .fold ((a, h) => h.length ? [... a, [h[0], h[1]]] : [], [])

  var reversals$ =
    get_clicks (reversals)
      .map (h => h.target.checked)
      .startWith (false)

  // TODO deck selection (Rider-Waite, Thoth, Wildwood)
  var deck$ = []

  var cards_dom$ =
    xs.combine (... [
      thrown$,
      placements$,
      reversals$,
    ])
      .map (([thrown, placements, reversals]) => {
        var shuffle = deck => {
          var ans = []
          var cards = F.p (deck) (
            L.map (h => [h, true])
            >> D.create
          )
          while (ans.length < deck.length) {
            var ks = D.keys (cards)
            var card = ks[Math.floor (Math.random () * ks.length)]
            delete cards[card]
            ans = L.cons (card) (ans)
          }
          return ans
        }

        var deck = shuffle (rider_waite[0]) // TODO deck selection
        var path = rider_waite[1]

        var draw = () => {
          if (thrown && deck.length) {
            var reversed = reversals && Math.random () < .5
            var ans = L.head (deck)
            deck = L.tail (deck)
            return [ans, reversed]
          }
          else {
            return ['back', false]
          }
        }

        return div (L.mapi (i => h => {
          var card = draw ()
          var image = `${s3_address}${path}${thrown ? card[0] : 'back'}.jpg`
          return (
            img (card[1] ? '.reversed' : '.upright', {
              attrs: {src: image},
              style: {
                height: card_height + 'px',
                width: card_width + 'px',
                position: 'absolute',
                top: h[1] - ctrl_panel_height + 'px',
                left: h[0] + 'px',
                'z-index': i,
              },
            })
          )
        }) (placements))
      })
      .startWith (div ())

  return {
    DOM: (
      xs.combine (... [
        cards_dom$,
        thrown$,
        time$,
      ])
        .map (([
          cards_dom,
          thrown,
        ]) =>
          div ({
            style: {
              height: '100%',
              width: '100%',
            }
          }, [
            // control bar
            button (throw_cards, {
              style: {width: '100px'},
              attrs: thrown ? {disabled: true} : undefined,
            }, ['Throw']),
            button (clear_throw, {style: {width: '100px'}}, ['Clear Cards']),
            button (clear_spread, {style: {width: '100px'}}, ['Clear Spread']),
            input (reversals, {attrs: D.extend ({type: 'checkbox'}) (thrown ? {disabled: true} : {})}), 'Reversals',
            // the card mat; the switch is to disable adding cards while thrown
            thrown
            ? (
              div ({
                style: {
                  position: 'fixed',
                  top: ctrl_panel_height + 'px',
                  bottom: '0px',
                  left: '0px',
                  right: '0px',
                },
              }, [
                cards_dom,
              ])
            )
            : (
              div ('#mat', {
                style: {
                  position: 'fixed',
                  top: ctrl_panel_height + 'px',
                  bottom: '0px',
                  left: '0px',
                  right: '0px',
                },
              }, [
                cards_dom,
              ])
            )
          ])
        )
    ),
  }
}
