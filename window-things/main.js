
// IMPORTANT: or UI will crash or won't work, without the stable DOM environment.
window.onload = function()
{

var growl = require('growl')

// Load native UI library
var gui = require('nw.gui');

// Create a tray icon
var tray = new gui.Tray({ title: 'Tray', icon: 'img/icon.jpg' });

tray.title = "System Tray"

// Give it a menu
var menu = new gui.Menu();
menu.append(new gui.MenuItem({ type: 'checkbox', label: 'box1' }));

var menu2 = new gui.Menu({type: 'menubar'});
menu2.append(new gui.MenuItem({ label: 'Item A' }));
menu2.append(new gui.MenuItem({ label: 'Item B' }));
menu2.append(new gui.MenuItem({ label: 'Item C' }));

var menu3 = new gui.Menu()
menu3.append(new gui.MenuItem({ label: 'Item A' }));
menu3.append(new gui.MenuItem({ label: 'Item B' }));

// NOT append.
var submitem = new gui.MenuItem({ label: 'Submenu' })
submitem.submenu = menu3
menu2.append(submitem);

//menu.popup(0,0)

tray.menu = menu;
gui.Window.get().menu = menu2


// Remove the tray
//tray.remove();
//tray = null;

growl('You have mail!')
console.log('#1 sent')

growl('5 new messages', { sticky: true })
console.log('#2 sent')

growl('5 new emails', { title: 'Email Client', image: 'Safari', sticky: true })
growl('Message with title', { title: 'Title'})
growl('Set priority', { priority: 2 })
growl('Show Safari icon', { image: 'Safari' })
growl('Show icon', { image: 'path/to/icon.icns' })
growl('Show image', { image: 'path/to/my.image.png' })
growl('Show png filesystem icon', { image: 'png' })
growl('Show pdf filesystem icon', { image: 'article.pdf' })
growl('Show pdf filesystem icon', { image: 'article.pdf' }, function(err){
  // ... notified
})


}
