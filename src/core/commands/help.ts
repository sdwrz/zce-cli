import { logger } from '../helpers'
import { load, commands } from '../loader'
import { Command, Context } from '../types'

/**
 * Print help info.
 * @param cmd command
 * @param ctx context
 */
export const outputHelp = (cmd: Command, ctx: Context): void => {
  if (cmd.description) {
    logger.info(cmd.description)
    logger.newline()
  }

  logger.info('Usage:')
  logger.info(logger.indent(`$ ${ctx.bin} ${cmd.usage || `${cmd.name} [options]`}`))

  if (!ctx.primary) {
    const cmds = Object.values(commands).filter(i => !i.hidden && i.name !== 'default')

    /* istanbul ignore else */
    if (cmds.length) {
      logger.newline()
      logger.info('Commands:')

      const cmdInfos = cmds.reduce((prev, current) => {
        const key = `${current.name}${current.alias ? ` (${current.alias})` : ''}`
        const value = current.description || /* istanbul ignore next */ '-'
        return { ...prev, [key]: value }
      }, {} as Record<string, string>)

      logger.info(logger.indent(logger.table(cmdInfos)))
    }
  }

  if (cmd.options) {
    logger.newline()
    logger.info('Options:')

    const opts = cmd.options
    const optInfos = Object.keys(opts).reduce((prev, current) => {
      const opt = opts[current]
      let key = `--${current}`
      let value = '-'
      if (typeof opt === 'object') {
        key = `--${current}${opt.alias ? `, -${opt.alias}` : ''}`
        value = (opt as Record<string, string>).description || '-'
      }
      return { ...prev, [key]: value }
    }, {} as Record<string, string>)

    logger.info(logger.indent(logger.table(optInfos)))
  }

  if (cmd.examples) {
    logger.newline()
    logger.info('Examples:')

    let { examples } = cmd
    if (typeof examples !== 'string') {
      examples = examples.join('\n$ ${ctx.bin} ')
    }
    logger.info(logger.indent(`$ ${ctx.bin} ${examples}`))
  }

  if (cmd.suggestions) {
    logger.newline()
    logger.info('Suggestions:')

    let { suggestions } = cmd
    if (typeof suggestions !== 'string') {
      suggestions = suggestions.join('\n$ ${ctx.bin} ')
    }
    logger.info(logger.indent(`$ ${ctx.bin} ${suggestions}`))
  }
}

/**
 * Invoke command help.
 * @param cmd command
 * @param ctx context
 */
export const invokeHelp = async (cmd: Command, ctx: Context): Promise<void> => {
  if (cmd.help) {
    // custom help
    if (typeof cmd.help === 'string') {
      logger.info(cmd.help)
    } else {
      await cmd.help(ctx)
    }
  } else {
    // default help
    outputHelp(cmd, ctx)
  }

  process.exit()
}

const command: Command = {
  name: 'help',
  usage: 'help <command>',
  description: 'output usage information.',
  action: async (ctx: Context) => {
    const cmd = await load(ctx.primary || 'default')
    return await invokeHelp(cmd, ctx)
  }
}

export default command
