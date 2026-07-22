import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarPicker from '../components/ui/CalendarPicker.vue'

describe('CalendarPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders with placeholder when no value', () => {
    const wrapper = mount(CalendarPicker, {
      props: { modelValue: '', placeholder: 'Выбрать дату' },
      attachTo: document.body,
    })
    expect(wrapper.text()).toContain('Выбрать дату')
    wrapper.unmount()
  })

  it('renders formatted date when value is set', () => {
    const wrapper = mount(CalendarPicker, {
      props: { modelValue: '2026-01-15' },
      attachTo: document.body,
    })
    expect(wrapper.text()).toContain('15.01.26')
    wrapper.unmount()
  })

  it('opens calendar on button click and shows month', async () => {
    const wrapper = mount(CalendarPicker, {
      props: { modelValue: '' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain('Январь')
    expect(document.body.textContent).toContain('2026')
    wrapper.unmount()
  })

  it('displays week day headers when open', async () => {
    const wrapper = mount(CalendarPicker, {
      props: { modelValue: '' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain('Пн')
    expect(document.body.textContent).toContain('Вт')
    expect(document.body.textContent).toContain('Ср')
    expect(document.body.textContent).toContain('Чт')
    expect(document.body.textContent).toContain('Пт')
    expect(document.body.textContent).toContain('Сб')
    expect(document.body.textContent).toContain('Вс')
    wrapper.unmount()
  })

  it('emits update:modelValue when date is clicked', async () => {
    const wrapper = mount(CalendarPicker, {
      props: { modelValue: '' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    const calendarBtns = document.body.querySelectorAll('button')
    let clicked = false
    for (const btn of calendarBtns) {
      if (btn.textContent?.trim() === '15' && btn.classList.contains('bg-accent')) {
        await btn.click()
        clicked = true
        break
      }
    }
    if (!clicked) {
      for (const btn of calendarBtns) {
        if (btn.textContent?.trim() === '15') {
          await btn.click()
          break
        }
      }
    }
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    wrapper.unmount()
  })

  it('closes calendar after date selection', async () => {
    const wrapper = mount(CalendarPicker, {
      props: { modelValue: '' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    const calendarBtns = document.body.querySelectorAll('button')
    for (const btn of calendarBtns) {
      const text = btn.textContent?.trim()
      if (text === '20' && !btn.classList.contains('cursor-not-allowed')) {
        await btn.click()
        break
      }
    }
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).not.toContain('Январь')
    wrapper.unmount()
  })
})
