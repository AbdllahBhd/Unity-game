using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class level_Loader : MonoBehaviour
{
    public Animator transition;
    public float whaite = 1f;
    // Update is called once per frame
    void Update()
    {
        
    }

    public void loadNexLevel()
    {
        StartCoroutine(LevelLoader(SceneManager.GetActiveScene().buildIndex + 1));
    }

    IEnumerator LevelLoader(int indexx)
    {
        
        yield return new WaitForSeconds(whaite);
        transition.SetTrigger("fade");
        yield return new WaitForSeconds(whaite+0.5f);

        SceneManager.LoadScene(indexx);

    }
}
