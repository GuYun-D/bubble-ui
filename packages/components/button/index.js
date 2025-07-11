import Button from './src/Button.vue'

Button.install = (app) => {
  app.component(Button.name, Button)
}

export const ZButton = Button

export default ZButton
