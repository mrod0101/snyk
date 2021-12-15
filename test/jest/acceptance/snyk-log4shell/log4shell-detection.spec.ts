import { createProjectFromFixture } from '../../util/createProject';
import { runSnykCLI } from '../../util/runSnykCLI';

jest.setTimeout(1000 * 60);

describe('log4shell command', () => {
  let env: Record<string, string>;

  beforeAll(() => {
    env = {
      ...process.env,
      SNYK_DISABLE_ANALYTICS: '1',
    };
  });

  it('includes expected output', async () => {
    const project = await createProjectFromFixture('unmanaged-log4j-fixture');

    const { code, stdout } = await runSnykCLI('log4shell', {
      cwd: project.path(),
      env,
    });

    expect(code).toBe(0);
    expect(stdout).toContain('log4shell lookup...');
  });
});
