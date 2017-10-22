const s3_address = 'https://s3.amazonaws.com/modern-tarot/'

const rider_waite = [
  ... L.range (0) (21),
  ... F.p (['W', 'S', 'C', 'P']) (
    L.map (h => L.map (h2 => h2 + h) ([... L.range (1) (10), 'P', 'N', 'Q', 'K']))
    >> L.reduce (L.append)
  ),
]

var main = sources => {
  var {DOM: DOM} = sources

  const add_upright = '#add_upright'
  const throw_cards = '#throw_cards'
  const clear_cards = '#clear_cards'
  const clear_spread = '#clear_spread'
  const clipboard = '#clipboard'

  const mat = '#mat'

  const ctrl_panel_height = 35

  const card_height = 260
  const card_width = 150

  var get_clicks = s => DOM.select (s).events ('click')

  // TODO figure out how to derive initial spread if url parameter is given

  var time$ = xs.periodic (10)

  var mode$ =
    xs.merge (... [
      get_clicks (throw_cards).mapTo ('thrown'),
      get_clicks (clear_cards).mapTo ('upright'),
      get_clicks (clear_spread).mapTo ('upright'),
    ])
      .startWith ('upright')

  var placements$ =
    xs.merge (... [
      get_clicks (mat).map (h => [h.x, h.y]),
      get_clicks (clear_spread).mapTo ('cleared'),
    ])
      .fold ((a, h) => h == 'cleared' ? [] : [... a, [h[0], h[1]]], [])

  // TODO deck selection (Rider-Waite, Thoth, Wildwood)
  var deck$ = []

  var cards_dom$ =
    xs.combine (... [
      mode$,
      placements$,
    ])
      .map (([mode, placements]) => {
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

        var deck = shuffle (rider_waite) // TODO deck selection

        var draw = () => {
          if (deck.length) {
            var ans = L.head (deck)
            deck = L.tail (deck)
            return ans
          }
          else {
            return 'images/cards/rider-waite/back.jpg'
          }
        }

        var get_image =
          mode == 'thrown'
          ? (h => s3_address + 'images/cards/rider-waite/' + draw () + '.jpg')
          : F.const (s3_address + 'images/cards/rider-waite/back.jpg')

        var i = 0
        var get_elem = h =>
          img ({
            attrs: {src: get_image (h)},
            style: {
              height: card_height + 'px',
              width: card_width + 'px',
              position: 'absolute',
              top: h[1] - card_height / 2 - ctrl_panel_height + 'px',
              left: h[0] - card_width / 2 + 'px',
              'z-index': i++,
            },
          })

        return div (L.map (get_elem) (placements))
      })
      .startWith (div ())


  return {
    DOM: (
      xs.combine (... [
        cards_dom$,
        mode$,
        time$,
      ])
        .map (([
          cards_dom,
          mode,
        ]) => {
          var buttons = [
            button (throw_cards, {
              style: {width: '100px'},
              attrs: mode == 'thrown' ? {disabled: true} : undefined,
            }, ['Throw']),
            button (clear_cards, {style: {width: '100px'}}, ['Clear Cards']),
            button (clear_spread, {style: {width: '100px'}}, ['Clear Spread']),
            button (clipboard, {style: {width: '100px'}}, ['Clipboard'])
          ]
          return (
            div ({
              style: {
                height: '100%',
                width: '100%',
              }
            }, [
              ... buttons,
              mode == 'thrown'
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
        })
    ),
  }
}
