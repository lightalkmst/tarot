// Page design:
//  Invisible element to prompt impaired users to switch to accessibility mode
//  Function panel
//   Add button
//    Turns click mode into setting cards
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


var main = ({
  DOM: DOM,
  HTTP: HTTP,
}) => {
  return {
    DOM: (
      xs.of (1)
        .map (h => {
          return (
            div ([
              button ('#add', {style: {width: '100px'}}, [
                'Add Card',
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
            ])
          )
        })
    ),
    // TODO: figure out how to call random.org
    // HTTP: xs.of (1).map (h =>
    //   url: '/login',
    //   category: 'session',
    //   method: 'POST',
    //   send: {
    //     user: document.getElementById ('user').value,
    //     pass: document.getElementById ('pass').value,
    //   },
    // ),
  }
}
