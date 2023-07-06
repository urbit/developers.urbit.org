+++
title = "Scry Reference"
weight = 3
+++

Here are Lick's scry endpoints. There's only a few and they're mostly just useful for debugging. All of Lick's scries are specified by a `care`, which is a single character corresponding to a command. 
The only `beam` it will respond to is the local identify, current timestamp, and any additonal informaiton a `care` needs. 

## `%a` - Read ports.

A scry with a `care` of `%a` will return a list of all registered IPC ports.

```
.^((list path) %la /=//=/ports)
~[/hood/reciept/control /slick/control]
```

## `%d` - Port Owner

A scry with a `care` of `%d` will return the duct of the IPC Port Owner. The `beam` will have to in clude the port identifier

```
.^((unit duct) %ld /===/[port-name])
[~ [i=/gall/use/slick/0w3.IZWEn/~nec t=[i=/dill t=~[//term/1]]]]
```

## `%u` - Port Existance

A scry with a `care` of `%u` will return if Lick has a Port registered in its state.

```
.^(@ %lu /===/slick/control)
0
```

