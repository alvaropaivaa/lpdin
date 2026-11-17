// Prints reais do sistema (pasta dinn-prints), já convertidos para WebP
const files = import.meta.glob('./assets/prints/*.webp', { eager: true, import: 'default' })

export const print = (name) => files[`./assets/prints/${name}.webp`]
