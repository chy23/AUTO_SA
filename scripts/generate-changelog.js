import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

function generateChangelog() {
  try {
    // Get total commit count to determine version base
    const totalCommitsStr = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    const totalCommits = parseInt(totalCommitsStr, 10);

    // We want to fetch 50 commits today (totalCommits is currently around 83)
    // and let the list grow in the future without capping it at 50.
    // 83 - 33 = 50. We use this offset to ensure all future commits are appended.
    const baseOffset = 33;
    const fetchCount = Math.max(50, totalCommits - baseOffset);

    // Format: Hash|Date|Subject|Body (separated by a custom delimiter to avoid conflicts)
    const delimiter = '|||--|||';
    // We use a custom separator for entries because body can contain newlines
    const entrySeparator = '===END_ENTRY===';
    const logCommand = `git log -n ${fetchCount} --pretty=format:"%H${delimiter}%cI${delimiter}%s${delimiter}%b${entrySeparator}" --no-merges`;
    const gitLogOutput = execSync(logCommand, { encoding: 'utf8' });

    const dataDir = join(process.cwd(), 'src', 'data');
    const outputPath = join(dataDir, 'changelog.json');
    
    // Read existing changelog to preserve manual edits and translations
    let existingChangelog = [];
    if (existsSync(outputPath)) {
      try {
        const fileContent = readFileSync(outputPath, 'utf8');
        existingChangelog = JSON.parse(fileContent);
      } catch (e) {
        console.warn('Could not parse existing changelog.json, starting fresh.');
      }
    }
    const existingHashes = new Set(existingChangelog.map(entry => entry.hash));

    const commits = gitLogOutput.split(entrySeparator).filter(line => line.trim().length > 0);
    const newEntries = [];
    commits.forEach((commitStr, index) => {
      const cleanedStr = commitStr.trim();
      if (!cleanedStr) return;
      
      const parts = cleanedStr.split(delimiter);
      if (parts.length >= 3) {
        const hash = parts[0];
        if (existingHashes.has(hash)) return; // Skip if already exists

        const date = parts[1];
        const subject = parts[2].trim();
        const body = parts[3] ? parts[3].trim() : '';
        const version = `v1.0.${totalCommits - index}`;

        let type = 'update';
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
        }

        newEntries.push({
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

    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Prepend new entries
    const finalChangelog = [...newEntries, ...existingChangelog];
    writeFileSync(outputPath, JSON.stringify(finalChangelog, null, 2), 'utf8');
    
    console.log(`Successfully updated changelog.json. Added ${newEntries.length} new entries.`);
  } catch (error) {
    console.error('Failed to generate changelog:', error.message);
    // Don't fail the build if git log fails (e.g., in a non-git environment)
  }
}

generateChangelog();
