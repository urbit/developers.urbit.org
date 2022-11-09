I'm preparing an article for the developer's site about current developer workflows.  Would you be willing to contribute?  All I'm looking for from you is answers to a few questions:

- What do you work on primarily in Urbit?
- What does your typical working environment look like?
- Is there something particularly cool or compelling you have figured out that eases your workflow?
- What would you like to see soon that would make doing what you do easier?

We asked 

---

## [`~tinnus-napbus`](https://urbit.org/ids/~tinnus-napbus)


What do you work on primarily in Urbit?
So far I have been focused on developer experience, primarily documentation. Going forward I will be focusing more on core development. Currently I'm working on implementing kelvin version shims so outdated apps which depend on an old kernel version can be run on newer kernels.
What does your typical working environment look like?
I work on a desktop machine running Arch linux with i3 tiling window manager. I usually use Doom Emacs with hoon-mode for writing hoon, but also sometime Vim with hoon.vim. Usually I have a fakezod in one window, Emacs in another, and then a billion terminal windows open across two screens and several workspaces , many running Vim with additional code I'm referencing. I am not very organised.
Is there something particularly cool or compelling you have figured out that eases your workflow?
Not really, I do most things manually. The only Urbit-related tools I use are syntax highlighting. I also use display-fill-column-indicator-mode in Emacs and put a line in column 80 so it's easy to see if code is creeping too far to the right; I find this quite useful for hoon.
What would you like to see soon that would make doing what you do easier?
I would like to see hoon-mode & hoon.vim be able to collapse arms of cores in a similar way to collapsing section headers in markdown & org-mode. I would also like the hoon.vim arm-search implemented in hoon-mode. I also have a bounty up for a desk import/export app - I think this would make it much easier working on fake ships where you can't simply |install apps over the network.

---

## [`~rovnys-ricfer`](https://urbit.org/ids/~rovnys-ricfer)

- What do you work on primarily in Urbit?
the kernel, with occasional forays into the runtime and userspace
- What does your typical working environment look like?
vim, and fakezods in a ~/ships folder
- What would you like to see soon that would make doing what you do easier?
make the pretty printer stop hanging

---

## [`~wicdev-wisryt`](https://urbit.org/ids/~wicdev-wisryt)

- I work mostly on Urbit's kernel and occasionally on its runtime.

- I use a 40" 4k monitor with full-screen tmux, with one large pane on top and five small panes across the bottom. The bottom panes are regular fish shells for running ships, using git, etc.

The top pane is neovim with minimal configuration. The biggest modifications are hoon.vim, a blue crosshair on the cursor (it's easy to lose your place on a large monitor), remapping ^h ^j ^k ^l to move around between neovim panes and tmux panes seamlessly, and swapping the numbers and symbols (so you can type symbols without using shift).

Neovim usually has 5-7 columns, and usually the rightmost one is hoon/lull/zuse, the leftmost one is another reference file and/or a notes file, and the middle ones are all the main file I'm working on, at various different points in the file.

For the ships, I use either a moon or fake ship, mount whatever desk I need, and in one pane run watch cp -LR <git_desk> <mount_point>. This copies the desk into the ship every two seconds. Then when I want to commit, I run |commit %desk on the ship, using ^R to quickly find the command.

I constantly copy ships so I can revert their state over and over to try things. Don't spend time waiting for ships to boot.

neovim config: [https://github.com/philipcmonk/dotfiles/blob/7a575b6c43e3a27bd54722a9c5ca456a54a8d974/vim.nix](https://github.com/philipcmonk/dotfiles/blob/7a575b6c43e3a27bd54722a9c5ca456a54a8d974/vim.nix)- For C, make heavy use of gdb. lldb is far worse than gdb for debugging urbit, so it's worth developing on a Linux box even if that means sshing into a server.

- I don't know about soon, but nock should be very debugger-friendly, I would love to see a well-done one.

---

## [`~rabsef-bicrym`](https://urbit.org/ids/~rabsef-bicrym)


(a) Primarily i work on userspace applications that express the breadth of the promise that Urbit brings to potential users.

(b) my working environment is VS code and one folder. I have 6 panes - 4 of code, 2 of wet and zod in terminal. The panes are in 2x3 arrangement. Sometimes I add additional panes. Basically top left is always the Agent, top right is "other agents and additional errata", middle left is sur files, middle right is lull, hoon, zuse, other sys files, bottom panes are left zod right wet.

(c) the biggest thing for me is building my desks replete with all of the mar files they need by hand and then using |new-desk %whatever which is available [https://github.com/urbit/urbit/pull/5360](https://github.com/urbit/urbit/pull/5360) and will be in next/arvo when released

(d) A hoon-first UI system would make me a single person full stack dev shop.

does that help? do you want more, less, different?

(c) further: If you just build all your desks with everything they need you don't have to get smacked with "what desks do I merge in here" which I find intensely annoying

also it's wasteful of files u don't need which just makes downloading your agent take longer

is bad practice

Another point here: When reading the engine pattern I find it helpful to have 2 panes of the same agent open side by side

in one pane you're seeing go-abet:go-able:go-past:go-fish:(go-abed 1 ~) and the other you're tracking back thru to each one of those functions

The pattern is very efficient for some things and is in use in a lot of tlon stuff and core, so reading it is important

and I find that to be the best way

---

## [`~palfun-foslup`](https://urbit.org/ids/~palfun-foslup)



primarily

kernel development for tlon, userspace development in my spare time

typical working environment

vscode with hoon syntax highlighting and a slightly borked tabnine install. no other hoon-writing-related assists otherwise. manual cp -RL and |commit into fakeships in a tmux session

cool or compelling

simply learn to live with the pain

like to see soon

i don't feel like i particularly need it, but hoon ide would be a _lot_ of fun. powerthesaurus integration and everything

to clarify on the "learn to live" point: i don't actually think the manual stuff is all that painful. takes me just a quick second or two to copy things in once it's all set up. "desk building" from the *-dev pkg directories is dumb and trimming it down is worth the effort, but also not that hard if you know what you're looking at

i realize this is a hot take (^:
