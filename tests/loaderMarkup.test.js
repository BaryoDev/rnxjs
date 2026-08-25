import { describe, it, expect } from 'vitest';
import { Column, Button } from '../index.js';
import { loadComponents, autoRegisterComponents } from '../index.js';
describe('loader preserves author markup', () => {
  it('Column keeps the class it was given', async () => {
    autoRegisterComponents();
    const d = document.createElement('div');
    document.body.appendChild(d);
    d.innerHTML = '<Column class="col-md-6"></Column>';
    loadComponents(d, null);
    await new Promise(r => setTimeout(r, 30));
    expect(d.firstElementChild.className).toContain('col-md-6');
  });
  it('a styled native button keeps its classes', async () => {
    autoRegisterComponents();
    const d = document.createElement('div');
    document.body.appendChild(d);
    d.innerHTML = '<button class="list-group-item list-group-item-action">Profile</button>';
    loadComponents(d, null);
    await new Promise(r => setTimeout(r, 30));
    expect(d.firstElementChild.className).toContain('list-group-item');
  });
  it('data-rnx-ignore opts out entirely', async () => {
    autoRegisterComponents();
    const d = document.createElement('div');
    document.body.appendChild(d);
    d.innerHTML = '<button class="mine" data-rnx-ignore>Plain</button>';
    loadComponents(d, null);
    await new Promise(r => setTimeout(r, 30));
    expect(d.firstElementChild.className).toBe('mine');
  });
});
