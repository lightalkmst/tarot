// Page design:
//  Invisible element to prompt impaired users to switch to accessibility mode
//  Function panel
//   Add Upright button
//    Turns click mode into setting cards
//    Disabled if thrown
//   Add Rotated button
//    Turns click mode into setting rotated cards
//    Disabled if thrown
//   Clear button
//    Removes all placeholders
//   Clear Spread
//    Removes all cards
//    Sets state to neutral
//   Shuffle
//    Shuffles deck
//    Disabled if thrown
//   Throw button
//    Deals cards
//    Sets state to thrown
//    Disabled if thrown or no cards added
//   Clipboard button
//    Saves spread/throw URL to clipboard
//  Card field
//    Draws placeholders in positions cards were added if neutral
//    Draws all cards in positions cards were added if thrown


var main = sources => {
  var {DOM: DOM} = sources

  const add_upright = '#add_upright'
  const add_rotated = '#add_rotated'
  const clear_cards = '#clear_cards'
  const clear_spread = '#clear_spread'
  const shuffle_deck = '#shuffle_deck'
  const throw_cards = '#throw_cards'
  const clipboard = '#clipboard'

  const mat = '#mat'

  const ctrl_panel_width = 100
  const ctrl_panel_width_str = ctrl_panel_width + 'px'

  var get_clicks = s => DOM.select (s).events ('click')

  // TODO deck selection (Rider-Waite, Thoth, Wildwood)

  var mode$ =
    xs.merge (...[
      get_clicks (add_upright).mapTo ('upright'),
      get_clicks (add_rotated).mapTo ('rotated'),
      get_clicks (clear_cards).mapTo (null),
      get_clicks (clear_spread).mapTo (null),
      get_clicks (shuffle_deck).mapTo (null),
      get_clicks (throw_cards).mapTo (null),
    ])

  var thrown$ =
    xs.merge (...[
      get_clicks (clear_cards).mapTo (false),
      get_clicks (clear_spread).mapTo (false),
      get_clicks (throw_cards).mapTo (true),
    ])

  // TODO figure out how to derive initial spread if url parameter is given
  var orientations$ =
    xs.merge (...[
      get_clicks (add_upright).mapTo ('upright'),
      get_clicks (add_rotated).mapTo ('rotated'),
    ])

  var positions$ =
    xs.combine (...[
      mode$,
      orientation$,
      get_clicks (mat).map (h => [h.x, h.y]),
    ])
      .filter (h => h[0])
      .map (h => [h[1], h[2]])

  var placements$ =
    xs.merge (...[
      get_clicks (clear_spread).mapTo ('cleared'),
      positions$,
    ])
      .fold ((a, h) => h == 'cleared' ? [] : [h, ...a], [])

  var cards$ =
    xs.combine (...[
      thrown$,
      placements$,
    ])
      .map (([thrown, placements]) => {


        var get_image =
          thrown
          ? F.const ('placeholder.jpg')
          : (h => {
            // TODO decide which card is rendered
          })

        return
      })


  return {
    DOM: (
      xs.combine (...[
        xs.of (1),
        cards_dom$,
      ])
        .map (([
          c,
          cards_dom,
        ]) => {
          var buttons = [
            button ('#add_upright', {style: {width: '100px'}}, [
              'Add Upright',
            ]),
            br (),
            button ('#add_rotated', {style: {width: '100px'}}, [
              'Add Rotated',
            ]),
            br (),
            button ('#clear_cards', {style: {width: '100px'}}, [
              'Clear Cards',
            ]),
            br (),
            button ('#clear_spread', {style: {width: '100px'}}, [
              'Clear Spread',
            ]),
            br (),
            button ('#shuffle', {style: {width: '100px'}}, [
              'Shuffle',
            ]),
            br (),
            button ('#throw', {style: {width: '100px'}}, [
              'Throw',
            ]),
          ]
          return (
            table ({
              style: {
                height: '100%',
                width: '100%',
              }
            }, [
              tr ([
                td (buttons),
                td ('#mat', {style: {width: '100%'})
              ]),
            ])
          )
        })
    ),
  }
}
