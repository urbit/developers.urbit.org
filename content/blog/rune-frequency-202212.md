+++
title = "Rune Utilization in Hoon"
date = "2023-01-09"
description = "An investigation of rune frequency in /sys."
[extra]
ship = "~lagrev-nocfep"
image = "https://www.nps.gov/articles/images/Archives-at-Iowa-State.png"
+++

![](https://www.nps.gov/articles/images/Archives-at-Iowa-State.png)

#   Rune Utilization in Hoon

##  Enquiry

I investigated the Urbit kernel for the actual usage rates of various Hoon runes in practice by experienced senior developers.  While I had done this [a few years ago](https://groups.google.com/a/urbit.org/g/dev/c/gAfhjAzccAk/m/WBpK2izmCgAJ) using a naïve regex match, this time I built the abstract syntax tree of every file in the kernel.  This allowed me to include irregular syntax and exclude non-runes (like the spurious `^~` non-ketsig in ``rose+[" " `~]^~[leaf+"*" (smyt pax)]``).

The survey was based on the contents of `/sys` as of ~2022.12.14.  For the first pass, every file in `/sys` was built using [`++reck`](https://developers.urbit.org/reference/hoon/stdlib/5d#reck) and [`++noah`](https://developers.urbit.org/reference/hoon/stdlib/5c#noah), e.g.

```hoon
*%/out/ames/txt &txt (noah !>((reck /===/sys/vane/ames)))
```

I tabulated the number of instances of each currently-supported Hoon rune from the AST.  While the particular values are noisy across commits, I expect secular trends to persist.

**Table 1**.  Rune AST labels.

| Rune | AST Label | Rune | AST Label | Rune | AST Label |
| --- | --- | --- | --- | --- | ---|
| `\|$` | `%brbc` | `\|_` | `%brcb` | `\|:` | `%brcl` |
| `\|%` | `%brcn` | `\|.` | `%brdt` | `\|-` | `%brhp` |
| `\|^` | `%brkt` | `\|@` | `%brpt` | `\|~` | `%brsg` |
| `\|*` | `%brtr` | `\|=` | `%brts` | `\|?` | `%brwt` |
| `:_` | `%clcb` | `:-` | `%clhp` | `:^` | `%clkt` |
| `:+` | `%clls` | `:~` | `%clsg` | `:*` | `%cltr` |
| `%_` | `%cncb` | `%:` | `%cncl` | `%.` | `%cndt` |
| `%-` | `%cnhp` | `%^` | `%cnkt` | `%+` | `%cnls` |
| `%~` | `%cnsg` | `%*` | `%cntr` | `%=` | `%cnts` |
| `.^` | `%dtkt` | `.+` | `%dtls` | `.*` | `%dttr` |
| `.=` | `%dtts` | `.?` | `%dtwt` | `^\|` | `%ktbr` |
| `^:` | `%ktcl` | `^.` | `%ktdt` | `^-` | `%kthp` |
| `^+` | `%ktls` | `^&` | `%ktpm` | `^~` | `%ktsg` |
| `^*` | `%kttr` | `^=` | `%ktts` | `^?` | `%ktwt` |
| `;:` | `%mccl` | `;/` | `%mcfs` | `;<` | `%mcgl` |
| `;;` | `%mcmc` | `;~` | `%mcsg` | `;=` | `%mcts` |
| `~$` | `%sgbc` | `~\|` | `%sgbr` | `~_` | `%sgcb` |
| `~%` | `%sgcn` | `~/` | `%sgfs` | `~<` | `%sggl` |
| `~>` | `%sggr` | `~+` | `%sgls` | `~&` | `%sgpm` |
| `~=` | `%sgts` | `~?` | `%sgwt` | `~!` | `%sgzp` |
| `=\|` | `%tsbr` | `=:` | `%tscl` | `=,` | `%tscm` |
| `=.` | `%tsdt` | `=/` | `%tsfs` | `=<` | `%tsgl` |
| `=>` | `%tsgr` | `=-` | `%tshp` | `=^` | `%tskt` |
| `=+` | `%tsls` | `=;` | `%tsmc` | `=~` | `%tssg` |
| `=*` | `%tstr` | `=?` | `%tswt` | `?\|` | `%wtbr` |
| `?:` | `%wtcl` | `?.` | `%wtdt` | `?<` | `%wtgl` |
| `?>` | `%wtgr` | `?-` | `%wthp` | `?#` | `%wthx` |
| `?^` | `%wtkt` | `?+` | `%wtls` | `?&` | `%wtpm` |
| `?@` | `%wtpt` | `?~` | `%wtsg` | `?=` | `%wtts` |
| `?!` | `%wtzp` | `!,` | `%zpcm` | `!<` | `%zpgl` |
| `!>` | `%zpgr` | `!,` | `%zpmc` | `!@` | `%zppt` |
| `!=` | `%zpts` | `!?` | `%zpwt` | `!!` | `%zpzp` |

The raw data can be generated at need from [the Urbit repo](https://github.com/urbit/urbit) by the technique above.


##  Results

This technique converted irregular syntax to regular syntax, but did not desugar runes.  This investigation thus reflects programmer intent at the object level of expression design.  A subsequent attempt with `++open:ap` to desugar runes would be instructive as to how Hoon “sees itself”.

**Table 2**.  Observed rune frequency in `/sys`.

| Rune | Count | Frequency | Percentile |
| --- | --- | --- | --- |
| `%:` | 9842 | 20.94% | 20.94% |
| `:*` | 5190 | 11.04% | 31.99% |
| `%=` | 3417 | 7.271% | 39.26% |
| `\|=` | 2320 | 4.937% | 44.19% |
| `^=` | 1845 | 3.926% | 48.12% |
| `^-` | 1727 | 3.675% | 51.79% |
| `%~` | 1622 | 3.451% | 55.25% |
| `=<` | 1548 | 3.294% | 58.54% |
| `=/` | 1525 | 3.245% | 61.78% |
| `?:` | 1385 | 2.947% | 64.73% |
| `.=` | 1229 | 2.615% | 67.35% |
| `=+` | 1208 | 2.57% | 69.92% |
| `?~` | 1080 | 2.298% | 72.21% |
| `?=` | 955 | 2.032% | 74.25% |
| `;~` | 803 | 1.709% | 75.96% |
| `%+` | 786 | 1.672% | 77.63% |
| `=.` | 640 | 1.362% | 78.99% |
| `^:` | 624 | 1.328% | 80.32% |
| `^+` | 599 | 1.275% | 81.59% |
| `%-` | 514 | 1.094% | 82.69% |
| `\|-` | 502 | 1.068% | 83.75% |
| `?.` | 482 | 1.026% | 84.78% |
| `:~` | 463 | 0.9852% | 85.76% |
| `~/` | 374 | 0.7958% | 86.56% |
| `^*` | 341 | 0.7256% | 87.29% |
| `?>` | 334 | 0.7107% | 88.0% |
| `?&` | 294 | 0.6256% | 88.62% |
| `=^` | 293 | 0.6235% | 89.25% |
| `:-` | 272 | 0.5788% | 89.82% |
| `?-` | 266 | 0.566% | 90.39% |
| `\|*` | 265 | 0.5639% | 90.95% |
| `.+` | 240 | 0.5107% | 91.47% |
| `=>` | 225 | 0.4788% | 91.94% |
| `\|%` | 223 | 0.4745% | 92.42% |
| `=*` | 210 | 0.4468% | 92.87% |
| `\|.` | 200 | 0.4256% | 93.29% |
| `!!` | 190 | 0.4043% | 93.7% |
| `~\|` | 186 | 0.3958% | 94.09% |
| `?!` | 171 | 0.3639% | 94.45% |
| `?\|` | 151 | 0.3213% | 94.78% |
| `=\|` | 148 | 0.3149% | 95.09% |
| `:_` | 146 | 0.3107% | 95.4% |
| `=?` | 138 | 0.2936% | 95.7% |
| `!>` | 136 | 0.2894% | 95.98% |
| `:+` | 134 | 0.2851% | 96.27% |
| `~>` | 130 | 0.2766% | 96.55% |
| `?^` | 116 | 0.2468% | 96.79% |
| `=-` | 109 | 0.2319% | 97.03% |
| `;:` | 105 | 0.2234% | 97.25% |
| `~_` | 103 | 0.2192% | 97.47% |
| `~%` | 84 | 0.1787% | 97.65% |
| `?+` | 82 | 0.1745% | 97.82% |
| `;;` | 72 | 0.1532% | 97.97% |
| `:^` | 61 | 0.1298% | 98.1% |
| `\|^` | 58 | 0.1234% | 98.23% |
| `~&` | 56 | 0.1192% | 98.35% |
| `~+` | 56 | 0.1192% | 98.47% |
| `?@` | 55 | 0.117% | 98.58% |
| `%^` | 53 | 0.1128% | 98.7% |
| `\|_` | 52 | 0.1106% | 98.81% |
| `=,` | 45 | 0.09575% | 98.9% |
| `%_` | 43 | 0.0915% | 98.99% |
| `^?` | 42 | 0.08937% | 99.08% |
| `^.` | 39 | 0.08299% | 99.17% |
| `\|~` | 36 | 0.0766% | 99.24% |
| `!<` | 35 | 0.07447% | 99.32% |
| `%.` | 33 | 0.07022% | 99.39% |
| `\|$` | 31 | 0.06596% | 99.45% |
| `\|@` | 29 | 0.06171% | 99.51% |
| `?<` | 26 | 0.05532% | 99.57% |
| `.*` | 25 | 0.0532% | 99.62% |
| `=;` | 24 | 0.05107% | 99.67% |
| `=:` | 24 | 0.05107% | 99.73% |
| `~?` | 19 | 0.04043% | 99.77% |
| `!,` | 16 | 0.03405% | 99.8% |
| `;/` | 16 | 0.03405% | 99.83% |
| `^\|` | 16 | 0.03405% | 99.87% |
| `%*` | 12 | 0.02553% | 99.89% |
| `\|:` | 11 | 0.02341% | 99.92% |
| `~!` | 8 | 0.01702% | 99.93% |
| `.^` | 8 | 0.01702% | 99.95% |
| `!?` | 4 | 0.008511% | 99.96% |
| `=~` | 4 | 0.008511% | 99.97% |
| `.?` | 4 | 0.008511% | 99.98% |
| `^~` | 3 | 0.006384% | 99.98% |
| `!=` | 2 | 0.004256% | 99.99% |
| `?#` | 2 | 0.004256% | 99.99% |
| `;=` | 2 | 0.004256% | 100.0% |
| `~<` | 1 | 0.002128% | 100.0% |
| `\|?` | 1 | 0.002128% | 100.0% |
| `!@` | 0 | 0.0% | 100.0% |
| `~=` | 0 | 0.0% | 100.0% |
| `~$` | 0 | 0.0% | 100.0% |
| `;<` | 0 | 0.0% | 100.0% |
| `^&` | 0 | 0.0% | 100.0% |

Rune frequency follows a [power-law distribution](https://en.wikipedia.org/wiki/Power_law) with 18 runes representing 80% of total rune utilization.  Indeed, several runes are _hapax legomena_ in `/sys` ([`|?` barwut](https://developers.urbit.org/reference/hoon/rune/bar#-barwut), [`~<`](https://developers.urbit.org/reference/hoon/rune/sig#-siggal)) or do not occur at all (discussed below).

![**Figure 1**.  Observed rune frequency in `/sys` as a power law.](https://storage.googleapis.com/media.urbit.org/blog/rune-frequency.png)

**Figure 1**.  Observed rune frequency in `/sys` as a power law.

(Bear with me on that graph:  it's rather hard to display order runes in any sort of coherent way I've come up with so far.)



##  Analysis

There aren't any real surprises here.  The most frequent runes reflect the most common design patterns:

- `%` cen rune calls tend to route through [`%:` cencol](https://developers.urbit.org/reference/hoon/rune/cen#-cencol) since the irregular form `(fun 1 2)` desugars to `%:`.
- [`:*` coltar](https://developers.urbit.org/reference/hoon/rune/col#-coltar) serves similarly as the desugaring of tuples constructed by `[1 2 3]`.
- [`%=` centis](https://developers.urbit.org/reference/hoon/rune/cen#-centis) is invoked through the irregular `$()` expression resets.  These are most commonly employed in gates and traps as a recursion, as well as to modify legs and in the nested core design pattern, e.g. `this(value new-value)`.
- [`^=` kettis](https://developers.urbit.org/reference/hoon/rune/ket#-kettis) happens in face assignments `a=1`.
- [`^-` kethep](https://developers.urbit.org/reference/hoon/rune/ket#--kethep) compile-time typechecks use tics or explicit rune passage.
- [`%~` censig](https://developers.urbit.org/reference/hoon/rune/cen#-censig) is used to pull an arm in a door.
- [`=<` tisgal](https://developers.urbit.org/reference/hoon/rune/tis#-tisgal) composes two expressions in inverted order.  I suspect this is arising from irregular composition patterns and implicit conses rather than being explicitly used.
- [`=/` tisfas](https://developers.urbit.org/reference/hoon/rune/tis#-tisfas) seems to be slightly preferred in more contemporary code to [`=+` tislus](https://developers.urbit.org/reference/hoon/rune/tis#-tislus), altho they carry out equivalent operations to pin a value to the subject.

Other common runes follow a similar logic based on common design patterns.

**Table 3**.  Observed rune frequency in `/sys`, eighteen runes representing 80% of all Hoon code in `/sys`.

| Rune | Count | Frequency | Percentile |
| --- | --- | --- | --- |
| `%:` | 9842 | 20.94% | 20.94% |
| `:*` | 5190 | 11.04% | 31.99% |
| `%=` | 3417 | 7.271% | 39.26% |
| `\|=` | 2320 | 4.937% | 44.19% |
| `^=` | 1845 | 3.926% | 48.12% |
| `^-` | 1727 | 3.675% | 51.79% |
| `%~` | 1622 | 3.451% | 55.25% |
| `=<` | 1548 | 3.294% | 58.54% |
| `=/` | 1525 | 3.245% | 61.78% |
| `?:` | 1385 | 2.947% | 64.73% |
| `.=` | 1229 | 2.615% | 67.35% |
| `=+` | 1208 | 2.57% | 69.92% |
| `?~` | 1080 | 2.298% | 72.21% |
| `?=` | 955 | 2.032% | 74.25% |
| `;~` | 803 | 1.709% | 75.96% |
| `%+` | 786 | 1.672% | 77.63% |
| `=.` | 640 | 1.362% | 78.99% |
| `^:` | 624 | 1.328% | 80.32% |

The least frequent runes include:

- [`|?` barwut](https://developers.urbit.org/reference/hoon/rune/bar#-barwut) produces a lead trap.  Like `^&` ketpam, lead cores have not yet proven to be a useful expedient in practice.
- [`~<` siggar](https://developers.urbit.org/reference/hoon/rune/sig#-siggar) applies hints for the runtime to process.  This can be helpful in debugging[.](https://www.youtube.com/watch?v=tbdpv7G_PPg)
- [`;=` mictis](https://developers.urbit.org/reference/hoon/rune/mic#-mictis) produces Sail code, unnecessary within the kernel.
- `?#` wuthax, as yet undocumented, is being developed as a replacement for [`?=` wuttis](https://developers.urbit.org/reference/hoon/rune/wut#-wuttis) that can better handle `list` detection.

A very few runes are never once used in the kernel.  Some are simply intended for transient or labile userspace code, for instance.

- [`^&` ketpam](https://developers.urbit.org/reference/hoon/rune/ket#-ketpam) produces a zinc core (covariant).  While included for completeness of the variance system, zinc cores have not turned up in effective design patterns yet within Urbit.
- [`;<` micgal](https://developers.urbit.org/reference/hoon/rune/mic#-micgal) acts as a macro rune for sequencing computations in threads, similar to [`;~` micsig](https://developers.urbit.org/reference/hoon/rune/mic#-micsig).
- [`~$` sigbuc](https://developers.urbit.org/reference/hoon/rune/sig#-sigbuc) is used for profiling code, and shouldn't be present in release code.
- [`~=` sigtis](https://developers.urbit.org/reference/hoon/rune/sig#-sigtis) detects duplicates, and is used for cleaning up memory from duplicate nouns.
- [`!@` zappat](https://developers.urbit.org/reference/hoon/rune/zap#-zappat) branches on wing existence; while it seems like this would be useful in the kernel, it is not employed in practice.

Rune labels like `%ktpm` that that occur in the codebase may not be represented even once in the final AST.  This is possible because `++ream` and `++reck` yield the names of terms as `+$dime` of `%tas` and `@ud`.

```hoon
i=[%leaf p=%tas q=1.836.086.379]
```

Of the other uncommon runes, I note as well that [`.^` dotket](https://developers.urbit.org/reference/hoon/rune/dot#-dotket) to peek or scry is important in userspace but that the kernel rarely needs this expedient.


##  Conclusion
 
My original intent several years ago was to treat such a frequency map as a pedagogical tool.  While there are compelling reasons not to treat rune frequency as a normative check on programmer behavior, knowing which runes are used the most in practice guides the sorts of Hoon which should be taught and documented most clearly first.

Subsequent investigations which may be illuminating include:

1. The change in rune utilization over time (based on age of commit).
2. The relative frequency differences in different vanes.
3. The desugared frequency of runes.
4. The characteristic rune frequency patterns in userspace code, or by programmer.

The kernel has important differences from userspace, but rune frequency in the kernel acts as a reference thumbprint for rune utilization by experienced senior developers in Urbit code.
