export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      secondary: 'blue',
      neutral: 'zinc',
      error: 'red',
      warning: 'amber',
      success: 'emerald',
      info: 'sky'
    },
    card: {
      slots: {
        root: 'bg-zinc-900/80 ring-1 ring-zinc-800/60 rounded-2xl shadow-xl shadow-black/10 backdrop-blur-sm',
        header: 'p-4 sm:p-5 border-b border-zinc-800/50',
        body: 'p-4 sm:p-5',
        footer: 'p-4 sm:p-5 border-t border-zinc-800/50'
      }
    },
    button: {
      slots: {
        base: 'font-medium transition-all duration-200'
      },
      variants: {
        size: {
          xl: {
            base: 'text-base px-5 py-3'
          }
        }
      }
    },
    input: {
      slots: {
        root: 'rounded-xl',
        base: 'bg-zinc-900/60 border-zinc-700/50 focus:border-primary-500/50 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-zinc-600'
      }
    },
    textarea: {
      slots: {
        base: 'bg-zinc-900/60 border-zinc-700/50 focus:border-primary-500/50 focus:ring-primary-500/20 rounded-xl transition-all duration-200 placeholder:text-zinc-600'
      }
    },
    select: {
      slots: {
        base: 'bg-zinc-900/60 border-zinc-700/50 rounded-xl'
      }
    },
    selectMenu: {
      slots: {
        base: 'bg-zinc-900/60 border-zinc-700/50 rounded-xl'
      }
    },
    badge: {
      slots: {
        base: 'font-medium'
      }
    },
    alert: {
      slots: {
        root: 'rounded-xl'
      }
    },
    modal: {
      slots: {
        content: 'bg-zinc-900 ring-1 ring-zinc-800 rounded-2xl shadow-2xl'
      }
    },
    progress: {
      slots: {
        root: 'rounded-full overflow-hidden',
        indicator: 'rounded-full transition-all duration-500'
      }
    },
    formField: {
      slots: {
        label: 'text-sm font-medium text-zinc-300 mb-1.5',
        description: 'text-xs text-zinc-500 mt-1'
      }
    },
    switch: {
      slots: {
        base: 'bg-zinc-700'
      }
    },
    separator: {
      slots: {
        root: 'border-zinc-800',
        label: 'text-xs text-zinc-500 font-medium tracking-wide'
      }
    },
    checkbox: {
      slots: {
        base: 'border-zinc-600 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500'
      }
    }
  }
})
