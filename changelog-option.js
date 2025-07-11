const { readFileSync } = require('fs')
const { join } = require('path')

module.exports = {
  gitRawCommitsOpts: {
    format: '%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci%n-authorName-%n%an%n-authorEmail-%n%ae'
  },
  writerOpts: {
    commitPartial: readFileSync(join(__dirname, 'templates/commit.hbs'), 'utf-8'),
    // 注释掉其他模板，避免 partials 报错
    // mainTemplate:  readFileSync(join(__dirname, 'templates/template.hbs'),'utf-8'),
    // headerPartial: readFileSync(join(__dirname, 'templates/header.hbs'),'utf-8'),
    // footerPartial: readFileSync(join(__dirname, 'templates/footer.hbs'),'utf-8'),
    ...getWriterOpts()
  }
}

function getWriterOpts() {
  return {
    transform: (commit, context) => {
      // 浅拷贝 commit，避免修改原始不可变对象
      const newCommit = { ...commit }
      const issues = []

      if (Array.isArray(newCommit.notes)) {
        newCommit.notes = newCommit.notes.map((note) => ({
          ...note,
          title: 'BREAKING CHANGES'
        }))
      }

      // 这段控制是否丢弃commit的flag
      let discard = !(newCommit.notes && newCommit.notes.length > 0)

      // 类型映射表
      const typeMap = {
        feat: '✨ Features | 新功能',
        fix: '🐛 Bug Fixes | Bug 修复',
        perf: '⚡ Performance Improvements | 性能优化',
        revert: '⏪ Reverts | 回退',
        improvement: '💩 Improvement | 优化改进',
        style: '💄 Styles | 风格',
        docs: '📝 Documentation | 文档',
        refactor: '♻ Code Refactoring | 代码重构',
        test: '✅ Tests | 测试',
        build: '👷‍ Build System | 构建',
        ci: '🔧 Continuous Integration | CI 配置',
        chore: '🎫 Chores | 其他更新'
      }

      if (newCommit.type in typeMap) {
        newCommit.type = typeMap[newCommit.type]
      } else if (discard) {
        // 如果类型不匹配且没有 BREAKING CHANGES，丢弃
        return
      }

      if (newCommit.scope === '*') {
        newCommit.scope = ''
      }

      if (typeof newCommit.hash === 'string') {
        newCommit.hash = newCommit.hash.substring(0, 7)
      }

      if (typeof newCommit.subject === 'string') {
        let url = context.repository ? `${context.host}/${context.owner}/${context.repository}` : context.repoUrl

        if (url) {
          url = `${url}/issues/`
          // Issue URL替换
          newCommit.subject = newCommit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue)
            return `[#${issue}](${url}${issue})`
          })
        }

        if (context.host) {
          // 用户URL替换
          newCommit.subject = newCommit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
            if (username.includes('/')) {
              return `@${username}`
            }
            return `[@${username}](${context.host}/${username})`
          })
        }
      }

      // 过滤 references，排除已经在 subject 中的 issue
      if (Array.isArray(newCommit.references)) {
        newCommit.references = newCommit.references.filter((reference) => !issues.includes(reference.issue))
      } else {
        newCommit.references = []
      }

      return newCommit
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title'
  }
}
