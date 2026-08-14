import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

function generateChangelog() {
  try {
    // Get total commit count to determine version base
    const totalCommitsStr = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    const totalCommits = parseInt(totalCommitsStr, 10);

    // Get the last 50 commits
    // Format: Hash|Date|Subject|Body (separated by a custom delimiter to avoid conflicts)
    const delimiter = '|||--|||';
    // We use a custom separator for entries because body can contain newlines
    const entrySeparator = '===END_ENTRY===';
    const logCommand = `git log -n 50 --pretty=format:"%H${delimiter}%cI${delimiter}%s${delimiter}%b${entrySeparator}" --no-merges`;
    const gitLogOutput = execSync(logCommand, { encoding: 'utf8' });

    const commits = gitLogOutput.split(entrySeparator).filter(line => line.trim().length > 0);
    const changelog = [];

    commits.forEach((commitStr, index) => {
      // Remove leading/trailing newlines that might exist between entries
      const cleanedStr = commitStr.trim();
      if (!cleanedStr) return;
      
      const parts = cleanedStr.split(delimiter);
      if (parts.length >= 3) {
        const hash = parts[0];
        const date = parts[1];
        const subject = parts[2].trim();
        const body = parts[3] ? parts[3].trim() : '';

        // Determine version number (e.g., v1.0.totalCommits - index)
        const version = `v1.0.${totalCommits - index}`;

        // Determine category based on Conventional Commits or simple prefixes
        let type = 'update'; // default
        let cleanSubject = subject;
        let isBugFix = false;

        const subjectLower = subject.toLowerCase();
        if (subjectLower.startsWith('fix:')) {
          type = 'bugfix';
          isBugFix = true;
          cleanSubject = subject.substring(4).trim();
        } else if (subjectLower.startsWith('feat:')) {
          type = 'feature';
          cleanSubject = subject.substring(5).trim();
        } else if (subjectLower.startsWith('chore:')) {
          type = 'chore';
          cleanSubject = subject.substring(6).trim();
        } else if (subjectLower.startsWith('refactor:')) {
          type = 'refactor';
          cleanSubject = subject.substring(9).trim();
        } else if (subjectLower.startsWith('style:')) {
          type = 'style';
          cleanSubject = subject.substring(6).trim();
        } else if (subjectLower.startsWith('docs:')) {
          type = 'docs';
          cleanSubject = subject.substring(5).trim();
        }

        changelog.push({
          version,
          hash,
          date,
          type,
          isBugFix,
          title: cleanSubject,
          details: body,
        });
      }
    });

    const dataDir = join(process.cwd(), 'src', 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = join(dataDir, 'changelog.json');
    writeFileSync(outputPath, JSON.stringify(changelog, null, 2), 'utf8');
    
    console.log(`Successfully generated changelog.json with ${changelog.length} entries.`);
  } catch (error) {
    console.error('Failed to generate changelog:', error.message);
    // Don't fail the build if git log fails (e.g., in a non-git environment)
  }
}

generateChangelog();
