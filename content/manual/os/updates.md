+++
title = "Updates"
description = "How updates work on Urbit"
template = "doc.html"
weight = 2
+++

The OS/kernel in Urbit is called Arvo. Arvo is run inside a virtual machine
called Vere - this is the `urbit` binary you execute in the terminal. You can
also install a number of userspace applications such as Groups, Bitcoin, Studio,
Pals, etc. Each of these layers—Vere, Arvo and apps—receive updates. In this
guide, we'll look at how to deal with these updates, the meaning of the update
notifications you'll get in Landscape, and how these layers depend on each other.

## Quick overview

{% table %}
* Name
* Description
* Example version
* Depends on
* Behavior
---
* Vere
* The runtime aka `urbit` binary
* `v1.10`
* Nothing
* Vere is typically backwards-compatible with older Arvo versions. Vere
  can be updated by either running its `next` command, or by downloading a new
  version and swapping them out. The ship must be shut down before performing
  either of these actions.
---
* Arvo
* The kernel and core libraries
* `[%zuse 418]`
* Vere
* Arvo depends on Vere. If Vere is incompatible, it will fail to boot. Arvo
  lives in the `%base` desk and receives over-the-air updates, typically from
  your sponsor. If an update requires a new Vere version, the update will be
  queued until Vere is updated. Arvo uses *kelvin versioning*, which means its
  version number counts down towards zero (therefore 418 is newer than 419).
  Apps can also block Arvo updates if they're not compatible, though a blocked
  Arvo update can be forced by suspending the blocking apps.
---
* Apps
* Groups, Bitcoin, Studio, Pals, etc
* `v1.0.14`
* Arvo
* Apps depend on Arvo. Every app specifies which Arvo version it is compatible
  with. Apps receive updates over-the-air from their publisher. If you try to
  install an app which requires a newer version of Arvo than you have, the
  installation will fail. If an existing app receives an update which requires a
  newer Arvo version, that update will be queued until Arvo is updated.
{% /table %}

## Update notifications

Update-related notifications will be shown in the notifications area of
Landscape. You may see one of these three messages:

#### The following (n) apps blocked a System Update

![apply system update
screenshot](https://media.urbit.org/operators/manual/os/updates/apply-system-update.png)

This means you've received an over-the-air kernel update, e.g. an update from
`[%zuse 419]` to `[%zuse 418]`. The update could not be applied because the
given apps are not compatible with the new kernel version, nor do they have
compatible updates pending. If you hit "Archive (n) apps and Apply System
Update", the blocking apps will be suspended and the kernel upgrade applied.
Once the apps in question receive compatible updates, they'll automatically be
updated and unsuspended.

If the blocking apps are important to you and you don't want to suspend them,
you may want to hold off on applying the kernel update and wait to receive
updates for those apps. You may also want to double-check you have automatic
updates enabled for the given apps. See the [app updates](#app-updates) section
below for more details.

#### App: "abc" is blocked from upgrading

![app blocking messages
screenshot](https://media.urbit.org/operators/manual/os/updates/app-blocked-messages.png)

These messages happen when an app has received an update, but it's for a newer
kernel version than you currently have, so it can't be installed. The update
will be queued until the kernel is updated, at which point it will be
automatically applied.

Such updates may be blocked because:

1. You have not yet received the new kernel update
2. You have received the kernel update but not all apps have received updates to
   make them compatible, so other apps are blocking the update. If this is the
   case, you'll also see the previous "The follow (n) apps..." notification.
3. You've received the kernel update and all apps have received updates to make
   them compatible, but the runtime is outdated so it's blocking the kernel
   update. If this is the case, you'll also see a "The runtime blocked..."
   message as shown in the next screenshot.
   
These kinds of messages don't usually require action. App developers will
typically ship app updates ahead of the kernel update release, so you'll see
these messages in the days before the release.

#### The runtime blocked a System Update

![runtime blocked system update
screenshot](https://media.urbit.org/operators/manual/os/updates/runtime-blocked-update.png)

This means you tried to apply a kernel update, but the runtime (the `urbit`
binary) is not compatible with the new kernel version. In this case, you'll need
to update the runtime. See the [runtime updates](#runtime-updates) section below
for how to do this.

## Runtime updates

As of version 1.9, the runtime has a built-in update mechanism. First, shut your
ship down. Then, run either `urbit next /path/to/your/pier` or `./your/pier/.run
next`, depending on whether it's docked. When you run `next`, it'll check for an
update, download it, and apply it. You can then start your ship up again. If the
update fails, check that `/your/pier/.bin/pace` contains `live`. If it has
`once`, edit it to say `live` and try running `next` again. Once you boot the
ship back up after updating the runtime, you may need to run `|bump` in the dojo
to apply any queued kernel updates.

If you're still running a binary older than 1.9, you'll need to:

1. Shut down your ship with `Ctrl+d` or by typing `|exit` in the dojo.
2. Download the new binary with the command given for your operating system in
   the [command line install guide](https://urbit.org/getting-started/cli).
3. Start your ship back up with the new `urbit` binary you downloaded.
4. If you have a kernel update that was blocked, run `|bump` in the dojo to
   apply it.

To check the current version of the runtime, the first line when you start up a
ship will say something like `urbit 1.10`. If you run the `urbit` binary without
specifying a pier or other arguments, it'll also say its version at the top of
the print-out.

## Kernel updates

Kernel updates are delivered in OTAs (over-the-air updates). For anything other
than a comet, this should be automatically configured with your sponsor as the
source. If you're running a comet, you may need to run `|ota (sein:title our now
our)` to enable them.

Arvo (the kernel) uses *kelvin versioning*, which mean version numbers count
down towards zero (therefore 418 is newer than 419). The version of the Zuse
utility library is used to represent the kernel version as a whole. You can
check the current version by typing `zuse` in the dojo.

The kernel requires that the runtime (`urbit` binary) is compatible with its
current version. The runtime is usually backwards-compatible with old kernel
versions, but not with new ones. This means if you're running an older version
of the runtime, it will block kernel updates.

All apps you install (such as Groups, Studio, Pals, etc) specify the kernel
version they're compatible with. If any apps have not received updates for the
new kernel version, they will block the kernel from updating.

This means that both the runtime and all apps must be up-to-date in order to
apply a kernel update. If either of these conditions are not met, you will be
notified in landscape as described in the [update
notifications](#update-notifications) section above, and you will need to take
the actions described.

If you have apps installed that simply don't have kernel-compatible updates
available, you can force the kernel update by clicking the button in the
notification [described above](#update-notifications), or by running `|bump,
=force &` in the dojo. Doing so will suspend the incompatible apps until they
receive compatible updates.

If the kernel update was blocked by an outdated runtime and you've since updated
the runtime, you can tell it to try applying the update again by running `|bump`
in the dojo.

To check if you have unapplied kernel updates queued, you can run `+vat %base`
in the dojo (or `+vats` if that doesn't work and look for the `%base` entry).
You'll see an output like this:

```
%base
  /sys/kelvin:      [%zuse 418]
  base hash:        0vu.fptbs.6f05p.c9ghb.qfh7e.sbhum.vfnnr.osfs7.vv1i1.qveva.dfvli
  %cz hash:         0vu.fptbs.6f05p.c9ghb.qfh7e.sbhum.vfnnr.osfs7.vv1i1.qveva.dfvli
  app status:       running
  force on:         ~
  force off:        ~
  publishing ship:  ~
  updates:          tracking
  source ship:      ~marzod
  source desk:      %kids
  source aeon:      8
  pending updates:  ~
::
```

The `updates` entry says whether automatic updates are enabled. If it doesn't
say `tracking`, you can run `|ota (sein:title our now our)` to enable them. The
`pending updates` section will list any blocked updates, it'll look something
like `~[[%zuse 417]]`. The `/sys/kelvin` line says the version it's currently
on.

## App updates

Apps (such as Groups, Studio, Pals, etc) receive OTA (over-the-air) updates from
their respective publishers. Automatic updates for each app should be enabled by
default when you install them. Normal updates (those unrelated to a kernel
update) should not require any user action - when you see the update
notification in Landscape it's already been done.

When there are kernel updates, app developers are encouraged to push updates for
their apps before the kernel update itself is deployed. This means you'll
probably see a bunch of notifications about app updates being blocked by the
`base` desk in the days before the kernel update ships. You don't need to worry
about these - the updates will be queued and automatically applied when the
kernel update arrives.

Sometimes, app developers may not get a kernel-compatible update out in time, or
else they have simply stopped maintaining the app. In this case, such apps will
block kernel updates, and you'll see the "The following (n) apps blocked a
System Update" notification [described above](#update-notifications). In this
case, the app will need to be suspended in order for the kernel update to
complete. You can do this either by clicking the button in that notification or
running `|bump, =force &` in the dojo. You should not manually suspend apps via
their tile menu or the `|suspend` command, because they will not be
automatically revived if they later receive a kernel-compatible update.

Automatic app updates can be paused with the `|pause %the-desk` command in the
dojo, and resumed with the `|resume %the-desk` command. The desk name may differ
from the app name - you can find the desk name by clicking on "App Info" in the
app tile's hamburger menu and looking for the "Installed into" entry.

To check the update status of an app, you can run the `+vat %the-desk` command
in the dojo (or `+vats` if that doesn't work and look for the entry matching the
desk name). It will give you a print-out like this:

```
> +vat %docs
%docs
  /sys/kelvin:      [%zuse 418]
  base hash:        0vu.moe96.kmq1d.a0nen.76vf6.t5qbc.aokqv.89fg5.avctv.pvq08.pdio0
  %cz hash:         0vu.moe96.kmq1d.a0nen.76vf6.t5qbc.aokqv.89fg5.avctv.pvq08.pdio0
  app status:       running
  force on:         ~
  force off:        ~
  publishing ship:  ~
  updates:          tracking
  source ship:      ~pocwet
  source desk:      %docs
  source aeon:      30
  pending updates:  ~
::
```

If there are `pending updates`, it usually means they're waiting for a kernel
update before they can be applied. The `updates` entry tells you whether
automatic updates are enabled - if it doesn't say `tracking` you can run
`|resume %the-desk` to turn them back on, or else run `|install
~the-publishing-ship %the-desk`.

## Further reading

- [Runtime Reference](https://operators.urbit.org/manual/running/vere) -
  this documents all the options and utilities of the `urbit` binary, such as
  `next`.
- [Dojo Tools](https://operators.urbit.org/manual/os/dojo-tools) - this includes
  documentation of many update and desk-related dojo commands.
